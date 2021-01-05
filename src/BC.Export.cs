using System.Drawing.Imaging;
using System.IO;
using System.Text.Json;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    internal static partial class BC
    {
        /// <summary>
        /// save files to disk to be put into source control or manually uploaded
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

            // prompt for image path prefix
            {
                var urlPrefixDialog = new StringDialog("Image Url Prefix", "Enter Image Path Prefix.", Document.Meta.ImagePathPrefix);
                if (DialogResult.OK != urlPrefixDialog.ShowDialog(MainForm))
                {
                    return;
                }
                var oldValue = Document.Meta.ImagePathPrefix;
                Document.Meta.ImagePathPrefix = urlPrefixDialog.Value;
                if (!Document.Meta.ImagePathPrefix.EndsWith("/"))
                {
                    Document.Meta.ImagePathPrefix += "/";
                }
                if (oldValue != Document.Meta.ImagePathPrefix)
                {
                    SetDirty(true);
                }
            }

            // write out roles.json
            {
                var path = Path.Combine(Document.Meta.ExportToDiskPath, "roles.json");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    ExportRolesJson(stream);
                }
            }

            var imageDir = Path.Combine(Document.Meta.ExportToDiskPath, "images");
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
        /// write roles.json
        /// </summary>
        /// <param name="stream"></param>
        static void ExportRolesJson(Stream stream)
        {
            using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
            {
                json.WriteStartArray();
                ExportMeta(json);
                foreach (var character in Document.Roles)
                {
                    ExportCharacter(character, json);
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
                json.WriteString("logo", $"{Document.Meta.ImagePathPrefix}images/logo.png");
            }
            json.WriteEndObject();
        }

        /// <summary>
        /// write out the object for one character
        /// </summary>
        /// <param name="character"></param>
        /// <param name="json"></param>
        static void ExportCharacter(SaveRole character, Utf8JsonWriter json)
        {
            json.WriteStartObject();
            json.WriteString("id", character.Id);
            if (character.ProcessedImage != null)
            {
                json.WriteString("image", $"{Document.Meta.ImagePathPrefix}images/{character.Id}.png");
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
