using System.Drawing.Imaging;
using System.IO;
using System.Text.Json;

namespace BloodstarClockticaLib
{
    public class BcExport
    {
        /// <summary>
        /// save output files to disk
        /// </summary>
        public static void ExportToDisk(BcDocument document, string directory, string urlPrefix)
        {
            document.Meta.UrlRoot = urlPrefix;
            // write out roles.json
            {
                var path = Path.Combine(directory, "roles.json");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    BcExport.ExportRolesJson(document, stream, UrlCombine(urlPrefix, "images"));
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
                    ExportCharacter(character, json, imageUrlPrefix);
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
            json.WriteString("name", document.Meta.Name);
            json.WriteString("author", document.Meta.Author);
            if (document.Meta.Logo != null)
            {
                json.WriteString("logo", UrlCombine(imageUrlPrefix,"logo.png"));
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
