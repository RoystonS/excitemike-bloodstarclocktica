using Renci.SshNet;
using System;
using System.Drawing.Imaging;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace BloodstarClockticaLib
{
    public class BcExport
    {
        /// <summary>
        /// do the upload
        /// </summary>
        public async static Task<bool> ExportViaSftp(BcDocument document, string password, IProgress<double> progress)
        {
            bool changedAny = false;
            progress.Report(0);
            var connectionInfo = new ConnectionInfo(
                document.Meta.SftpHost,
                document.Meta.SftpPort,
                document.Meta.SftpUser,
                new PasswordAuthenticationMethod(document.Meta.SftpUser, password),
                new PrivateKeyAuthenticationMethod("rsa.key")
            );

            bool settingsChanged = (document.Meta.SftpHost != document.Meta.PrevSftpHost) || 
                                   (document.Meta.SftpRemoteDirectory != document.Meta.PrevSftpRemoteDirectory) ||
                                   (document.Meta.SftpPort != document.Meta.PrevSftpPort) ||
                                   (document.Meta.SftpUser != document.Meta.PrevSftpUser);
            if (settingsChanged)
            {
                changedAny |= document.MarkAllImagesInNeedOfReupload();
            }

            bool canSkipUnchanged = document.Meta.SkipUnchanged && !settingsChanged;

            using (var client = new SftpClient(connectionInfo))
            {
                try
                {
                    client.Connect();
                    await Task.Run(() => ExportViaSftp(document, client, canSkipUnchanged, progress));
                    document.Meta.PrevSftpHost = document.Meta.SftpHost;
                    document.Meta.PrevSftpRemoteDirectory = document.Meta.SftpRemoteDirectory;
                    document.Meta.PrevSftpPort = document.Meta.SftpPort;
                    document.Meta.PrevSftpUser = document.Meta.SftpUser;
                    changedAny |= document.MarkAllImagesUploaded();
                }
                finally
                {
                    client.Disconnect();
                }
            }

            return changedAny;
        }

        /// <summary>
        /// do the upload
        /// </summary>
        private static void ExportViaSftp(BcDocument document, SftpClient client, bool canSkipUnchanged, IProgress<double> progress)
        {
            double num = 1;
            double denom = 3 + document.Characters.Count;
            progress.Report(num / denom);

            // roles.json
            try
            {
                client.ChangeDirectory(document.Meta.SftpRemoteDirectory);
            }
            catch (Renci.SshNet.Common.SftpPathNotFoundException)
            {
                client.CreateDirectory(document.Meta.SftpRemoteDirectory);
                client.ChangeDirectory(document.Meta.SftpRemoteDirectory);
            }
            using (var stream = new MemoryStream())
            {
                var imageUrlPrefix = UrlCombine(document.Meta.UrlRoot, "images");
                ExportRolesJson(document, stream, imageUrlPrefix);
                stream.Position = 0;
                client.UploadFile(stream, "roles.json", true);
                progress.Report(num++ / denom);
            }

            // go to images directory
            client.ChangeDirectory("/");
            var remoteImagesDirectory = UrlCombine(document.Meta.SftpRemoteDirectory, "images");
            try
            {
                client.ChangeDirectory(remoteImagesDirectory);
            }
            catch (Renci.SshNet.Common.SftpPathNotFoundException)
            {
                client.CreateDirectory(remoteImagesDirectory);
                client.ChangeDirectory(remoteImagesDirectory);
            }

            // logo
            if (document.Meta.Logo != null)
            {
                if (!canSkipUnchanged || !document.Meta.LogoUploaded )
                {
                    using (var stream = new MemoryStream())
                    {
                        document.Meta.Logo.Save(stream, ImageFormat.Png);
                        stream.Position = 0;
                        client.UploadFile(stream, "logo.png", true);
                    }
                }
            }
            progress.Report(num++ / denom);

            // character tokens
            foreach (var character in document.Characters)
            {
                if (character.IncludeInExport)
                {
                    if (character.ProcessedImage != null)
                    {
                        if (!canSkipUnchanged || !character.ImageUploaded)
                        {
                            using (var stream = new MemoryStream())
                            {
                                character.ProcessedImage.Save(stream, ImageFormat.Png);
                                stream.Position = 0;
                                client.UploadFile(stream, $"{character.Id}.png", true);
                            }
                        }
                    }
                }
                progress.Report(num++ / denom);
            }
            progress.Report(num / denom);
        }

        /// <summary>
        /// link to roles.json after upload
        /// </summary>
        public static string RolesUrl(BcDocument document) => UrlCombine(document.Meta.UrlRoot, "roles.json");

        /// <summary>
        /// save output files to disk
        /// </summary>
        public static void ExportToDisk(BcDocument document, string directory, string imageUrlPrefix)
        {
            // write out roles.json
            {
                var path = Path.Combine(directory, "roles.json");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    ExportRolesJson(document, stream, imageUrlPrefix);
                }
            }

            // created images dir
            var imageDir = Path.Combine(directory, "images");
            Directory.CreateDirectory(imageDir);

            // write out logo
            if (document.Meta.Logo != null)
            {
                var path = Path.Combine(imageDir, "logo.png");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    document.Meta.Logo.Save(stream, ImageFormat.Png);
                }
            }

            // write out each character's image
            foreach (var character in document.Characters)
            {
                if (character.IncludeInExport && (character.ProcessedImage != null))
                {
                    var path = Path.Combine(imageDir, $"{character.Id}.png");
                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        character.ProcessedImage.Save(stream, ImageFormat.Png);
                    }
                }
            }
        }

        /// <summary>
        /// write roles.json
        /// </summary>
        /// <param name="document"></param>
        /// <param name="stream"></param>
        /// <param name="imageUrlPrefix"></param>
        internal static void ExportRolesJson(BcDocument document, Stream stream, string imageUrlPrefix)
        {
            using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
            {
                json.WriteStartArray();
                ExportMeta(document, json, imageUrlPrefix);
                foreach (var character in document.Characters)
                {
                    if (character.IncludeInExport)
                    {
                        ExportCharacter(character, json, imageUrlPrefix);
                    }
                }
                json.WriteEndArray();
                json.Flush();
            }
        }

        /// <summary>
        /// write out the "_meta" object
        /// </summary>
        internal static void ExportMeta(BcDocument document, Utf8JsonWriter json, string imageUrlPrefix)
        {
            json.WriteStartObject();
            json.WriteString("id", "_meta");
            json.WriteString("exportTime", $"{DateTime.Now:U}");
            json.WriteString("name", document.Meta.Name);
            json.WriteString("author", document.Meta.Author);
            if (document.Meta.Logo != null)
            {
                json.WriteString("logo", UrlCombine(imageUrlPrefix, "logo.png"));
            }
            json.WriteEndObject();
        }

        /// <summary>
        /// write out the object for one character
        /// </summary>
        static void ExportCharacter(BcCharacter character, Utf8JsonWriter json, string imageUrlPrefix)
        {
            json.WriteStartObject();
            json.WriteString("id", character.Id);
            if (character.ProcessedImage != null)
            {
                json.WriteString("image", UrlCombine(imageUrlPrefix, $"{character.Id}.png"));
            }
            json.WriteString("edition", "custom");
            json.WriteNumber("firstNight", string.IsNullOrWhiteSpace(character.FirstNightReminder) ? 0 : character.FirstNightOrder);
            json.WriteString("firstNightReminder", character.FirstNightReminder);
            json.WriteNumber("otherNight", string.IsNullOrWhiteSpace(character.OtherNightReminder) ? 0 : character.OtherNightOrder);
            json.WriteString("otherNightReminder", character.OtherNightReminder);
            json.WriteStartArray("reminders");
            foreach (var reminder in character.ReminderTokens)
            {
                if (!string.IsNullOrWhiteSpace(reminder))
                {
                    json.WriteStringValue(reminder);
                }
            }
            json.WriteEndArray();
            json.WriteStartArray("remindersGlobal");
            foreach (var reminder in character.GlobalReminderTokens)
            {
                if (!string.IsNullOrWhiteSpace(reminder))
                {
                    json.WriteStringValue(reminder);
                }
            }
            json.WriteEndArray();
            json.WriteBoolean("setup", character.Setup);
            json.WriteString("name", character.Name);
            json.WriteString("team", BcTeam.ToExportString(character.Team));
            json.WriteString("ability", character.Ability);
            json.WriteEndObject();
        }

        /// <summary>
        /// add subpath onto url prefix without having to pay attention to whether the '/' is there at the end of a or start of b
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        /// <returns></returns>
        private static string UrlCombine(string a, string b)
        {
            if (a == "") { return b; }
            if (b == "") { return a; }
            return $"{a.TrimEnd('/', '\\')}/{b.TrimStart('/', '\\')}";
        }
    }
}
