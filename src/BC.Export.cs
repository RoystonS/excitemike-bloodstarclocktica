using Renci.SshNet;
using System;
using System.Drawing.Imaging;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    internal static partial class BC
    {
        /// <summary>
        /// save output files to disk
        /// </summary>
        internal static void ExportToDisk()
        {
            // prompt to select folder
            {
                var folderDialog = new OpenFileDialog
                {
                    ValidateNames = false,
                    CheckFileExists = false,
                    CheckPathExists = true,
                    FileName = "Folder Selection.",
                    Title = "Select Directory for Export",
                    InitialDirectory = Document.Meta.ExportToDiskPath
                };
                if (DialogResult.OK != folderDialog.ShowDialog())
                {
                    return;
                }
                var oldValue = Document.Meta.ExportToDiskPath;
                Document.Meta.ExportToDiskPath = Path.GetDirectoryName(folderDialog.FileName);
                if (oldValue != Document.Meta.ExportToDiskPath)
                {
                    SetDirty(true);
                }
            }

            ExportToDisk(Document.Meta.ExportToDiskPath);
        }

        /// <summary>
        /// save files to disk
        /// </summary>
        internal static void ExportToDisk(string exportFolder)
        {
            // prompt for image path prefix
            {
                var urlPrefixDialog = new StringDialog("Image Url Prefix", "Enter Url Prefix.", Document.Meta.UrlRoot);
                if (DialogResult.OK != urlPrefixDialog.ShowDialog(MainForm))
                {
                    return;
                }
                var oldValue = Document.Meta.UrlRoot;
                Document.Meta.UrlRoot = urlPrefixDialog.Value;
                if (oldValue != Document.Meta.UrlRoot)
                {
                    SetDirty(true);
                }
            }

            // write out roles.json
            {
                var path = Path.Combine(exportFolder, "roles.json");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    ExportRolesJson(stream, Document.Meta.ImageUrlPrefix);
                }
            }

            var imageDir = Path.Combine(exportFolder, "images");
            Directory.CreateDirectory(imageDir);
            // write out logo
            if (Document.Meta.Logo != null)
            {
                var path = Path.Combine(imageDir, "logo.png");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    Document.Meta.Logo.Save(stream, ImageFormat.Png);
                }
            }

            // write out each character's image
            foreach (var character in Document.Roles)
            {
                if (character.ProcessedImage != null)
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
        /// Prompt for connection settings and upload
        /// </summary>
        internal async static void ExportSftp()
        {
            string password = "";
            if (!PromptForUploadSettings(ref password))
            {
                return;
            }

            var progressPopup = new ProgressPopup();
            MainForm.Enabled = false;
            progressPopup.Show(MainForm);
            var connectionInfo = new ConnectionInfo(
                Document.Meta.SftpHost,
                Document.Meta.SftpPort,
                Document.Meta.SftpUser,
                new PasswordAuthenticationMethod(Document.Meta.SftpUser, password),
                new PrivateKeyAuthenticationMethod("rsa.key")
            );
            using (var client = new SftpClient(connectionInfo))
            {
                try
                {
                    client.Connect();
                    try
                    {
                        var progress = new Progress<int>(percent =>
                        {
                            progressPopup.ProgressBar.Value = percent;
                        });
                        await Task.Run(() => ExportSftp(client, progress));
                    }
                    catch (Exception e)
                    {
                        MessageBox.Show($"{e.Message}\n{e.StackTrace}");
                    }
                    finally
                    {
                        progressPopup.Close();
                        MainForm.Enabled = true;
                        var popup = new LinkMessageBox("Upload Complete", "Roles.json is available at:", $"{Document.Meta.RolesUrl}?{DateTime.Now:MMddHHmmss}");
                        popup.ShowDialog(MainForm);
                    }
                }
                catch (Exception e)
                {
                    MessageBox.Show($"Error uploading via SFTP.\n{e.Message}\n{e.StackTrace}");
                }
                finally
                {
                    client.Disconnect();
                }
            }
        }

        /// <summary>
        /// Prompt the user for upload/export settings
        /// </summary>
        /// <param name="password"></param>
        /// <returns>true if the user clicked ok</returns>
        private static bool PromptForUploadSettings(ref string password)
        {
            var popup = new FtpConnectionInfo();
            if (popup.ShowDialog(MainForm) == DialogResult.OK)
            {
                password = popup.PasswordTextBox.Text;
                return true;
            }
            return false;
        }

        /// <summary>
        /// write each file to the SftpClient, reporting progress
        /// </summary>
        /// <param name="client"></param>
        /// <param name="progress"></param>
        static void ExportSftp(SftpClient client, IProgress<int> progress)
        {
            var num = 1;
            var denom = 3 + Document.Roles.Count;
            progress.Report(100 * num / denom);

            // roles.json
            try
            {
                client.ChangeDirectory(Document.Meta.SftpRemoteDirectory);
            }
            catch (Renci.SshNet.Common.SftpPathNotFoundException)
            {
                client.CreateDirectory(Document.Meta.SftpRemoteDirectory);
                client.ChangeDirectory(Document.Meta.SftpRemoteDirectory);
            }
            using (var stream = new MemoryStream())
            {
                ExportRolesJson(stream, Document.Meta.ImageUrlPrefix);
                stream.Position = 0;
                client.UploadFile(stream, "roles.json", true);
                progress.Report(100 * num++ / denom);
            }

            // go to images directory
            client.ChangeDirectory("/");
            try
            {
                client.ChangeDirectory(Document.Meta.SftpRemoteImagesDirectory);
            }
            catch (Renci.SshNet.Common.SftpPathNotFoundException)
            {
                client.CreateDirectory(Document.Meta.SftpRemoteImagesDirectory);
                client.ChangeDirectory(Document.Meta.SftpRemoteImagesDirectory);
            }

            // logo
            if (Document.Meta.Logo != null)
            {
                using (var stream = new MemoryStream())
                {
                    Document.Meta.Logo.Save(stream, ImageFormat.Png);
                    stream.Position = 0;
                    client.UploadFile(stream, "logo.png", true);
                }
            }
            progress.Report(100 * num++ / denom);

            // character tokens
            foreach (var character in Document.Roles)
            {
                if (character.ProcessedImage != null)
                {
                    using (var stream = new MemoryStream())
                    {
                        character.ProcessedImage.Save(stream, ImageFormat.Png);
                        stream.Position = 0;
                        client.UploadFile(stream, $"{character.Id}.png", true);
                    }
                }
                progress.Report(100 * num++ / denom);
            }
            progress.Report(100 * num / denom);
        }

        /// <summary>
        /// write roles.json
        /// </summary>
        /// <param name="stream"></param>
        static void ExportRolesJson(Stream stream, string imageUrlPrefix)
        {
            using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
            {
                json.WriteStartArray();
                ExportMeta(json);
                foreach (var character in Document.Roles)
                {
                    ExportCharacter(character, json, imageUrlPrefix);
                }
                json.WriteEndArray();
                json.Flush();
            }
        }

        /// <summary>
        /// write out the "_meta" object
        /// </summary>
        /// <param name="json"></param>
        static void ExportMeta(Utf8JsonWriter json)
        {
            json.WriteStartObject();
            json.WriteString("id", "_meta");
            json.WriteString("name", Document.Meta.Name);
            json.WriteString("author", Document.Meta.Author);
            if (Document.Meta.Logo != null)
            {
                json.WriteString("logo", $"{Document.Meta.ImageUrlPrefix}logo.png");
            }
            json.WriteEndObject();
        }

        /// <summary>
        /// write out the object for one character
        /// </summary>
        /// <param name="character"></param>
        /// <param name="json"></param>
        /// <param name="pathPrefix"></param>
        static void ExportCharacter(SaveRole character, Utf8JsonWriter json, string imageUrlPrefix)
        {
            json.WriteStartObject();
            json.WriteString("id", character.Id);
            if (character.ProcessedImage != null)
            {
                json.WriteString("image", $"{imageUrlPrefix}{character.Id}.png");
            }
            json.WriteString("edition", "custom");
            json.WriteNumber("firstNight", character.FirstNightOrder);
            json.WriteString("firstNightReminder", character.FirstNightReminder);
            json.WriteNumber("otherNight", character.OtherNightOrder);
            json.WriteString("otherNightReminder", character.OtherNightReminder);
            json.WriteStartArray("reminders");
            foreach (var reminder in character.ReminderTokens)
            {
                json.WriteStringValue(reminder);
            }
            json.WriteEndArray();
            json.WriteStartArray("remindersGlobal");
            foreach (var reminder in character.GlobalReminderTokens)
            {
                json.WriteStringValue(reminder);
            }
            json.WriteEndArray();
            json.WriteBoolean("setup", character.Setup);
            json.WriteString("name", character.Name);
            json.WriteString("team", SaveTeam.ToString(character.Team));
            json.WriteString("ability", character.Ability);
            json.WriteEndObject();
        }
    }
}
