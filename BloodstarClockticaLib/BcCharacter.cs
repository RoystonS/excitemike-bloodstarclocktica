using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

namespace BloodstarClockticaLib
{
    public class BcCharacter
    {
        internal static string RoleDir = "roles";
        internal static string SourceImageDir = "src_images";
        internal static string ProcessedImageDir = "processed_images";

        /// <summary>
        /// the internal ID for this character, without spaces or special characters
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// the displayed name of this character
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// which category of character it is
        /// </summary>
        public BcTeam.TeamValue Team { get; set; }

        private BindingList<string> reminderTokens;

        private BindingList<string> globalReminderTokens;

        private bool setup;

        private string ability;

        private int firstNightOrder;

        private int otherNightOrder;

        private string firstNightReminder;

        private string otherNightReminder;

        public Image SourceImage { get; set; }

        public Image ProcessedImage { get; set; }

        /// <summary>
        /// Get a unique character id
        /// </summary>
        /// <returns></returns>
        internal static string UniqueCharacterId(BcDocument document)
        {
            var prefix = "newcharacter";
            var n = 1;
            if (document != null)
            {
                while (!document.IsIdAvailable($"{prefix}{n}", -1))
                {
                    n++;
                }
            }
            return $"{prefix}{n}";
        }

        /// <summary>
        /// create default character
        /// </summary>
        public BcCharacter(BcDocument document)
        {
            SetDefaults(document);
        }

        private void SetDefaults(BcDocument document)
        {
            Id = UniqueCharacterId(document);
            Name = "New Character";
            Team = BcTeam.TeamValue.Townsfolk;
            reminderTokens = new BindingList<string>();
            globalReminderTokens = new BindingList<string>();
            setup = false;
            ability = "";
            firstNightOrder = 0;
            otherNightOrder = 0;
            firstNightReminder = "";
            otherNightReminder = "";
            SourceImage = null;
            ProcessedImage = null;
        }

        /// <summary>
        /// read character from archive
        /// </summary>
        /// <param name="archive"></param>
        /// <param name="id"></param>
        public BcCharacter(BcDocument document, ZipArchive archive, string id)
        {
            SetDefaults(document);

            var jsonEntry = archive.GetEntry($"{RoleDir}{BcDocument.PathSep}{id}.json");
            var srcImageEntry = archive.GetEntry($"{SourceImageDir}{BcDocument.PathSep}{id}.png");
            var processedImageEntry = archive.GetEntry($"{ProcessedImageDir}{BcDocument.PathSep}{id}.png");

            // json
            using (var stream = jsonEntry.Open())
            {
                var ms = new MemoryStream();
                stream.CopyTo(ms);
                Utf8JsonReader json = new Utf8JsonReader(new ReadOnlySpan<byte>(ms.ToArray()));
                // skip object start token
                json.Read();
                while (json.Read())
                {
                    if (json.TokenType == JsonTokenType.EndObject)
                    {
                        break;
                    }
                    else if (json.TokenType == JsonTokenType.PropertyName)
                    {
                        string propertyName = json.GetString();
                        json.Read();
                        switch (propertyName)
                        {
                            case "id":
                                this.Id = json.GetString();
                                break;
                            case "name":
                                this.Name = json.GetString();
                                break;
                            case "team":
                                this.Team = BcTeam.FromString(json.GetString());
                                break;
                            case "reminders":
                                {
                                    var list = new BindingList<string>();
                                    if (json.TokenType != JsonTokenType.StartArray) { throw new Exception("Expected an array for reminder_tokens"); }
                                    json.Read();
                                    while (json.TokenType != JsonTokenType.EndArray)
                                    {
                                        list.Add(json.GetString());
                                        json.Read();
                                    }
                                    this.reminderTokens = list;
                                }
                                break;
                            case "globalReminders":
                                {
                                    var list = new BindingList<string>();
                                    if (json.TokenType != JsonTokenType.StartArray) { throw new Exception("Expected an array for reminder_tokens"); }
                                    json.Read();
                                    while (json.TokenType != JsonTokenType.EndArray)
                                    {
                                        list.Add(json.GetString());
                                        json.Read();
                                    }
                                    this.globalReminderTokens = list;
                                }
                                break;
                            case "setup":
                                this.setup = json.GetBoolean();
                                break;
                            case "ability":
                                this.ability = json.GetString();
                                break;
                            case "firstNight":
                                this.firstNightOrder = json.GetInt32();
                                break;
                            case "otherNight":
                                this.otherNightOrder = json.GetInt32();
                                break;
                            case "firstNightReminder":
                                this.firstNightReminder = json.GetString();
                                break;
                            case "otherNightReminder":
                                this.otherNightReminder = json.GetString();
                                break;
                            default:
                                Console.Error.WriteLine($"unhandled property: \"{propertyName}\"");
                                json.Skip();
                                break;
                        }
                    }
                }
            }

            // source image
            if (srcImageEntry != null)
            {
                using (var stream = srcImageEntry.Open())
                {
                    this.SourceImage = Image.FromStream(stream);
                }
            }

            // processed image
            if (processedImageEntry != null)
            {
                using (var stream = processedImageEntry.Open())
                {
                    this.ProcessedImage = Image.FromStream(stream);
                }
            }
        }

        /// <summary>
        /// Save the characters's json file and associated images in the .zip
        /// </summary>
        /// <param name="archive"></param>
        public void Save(ZipArchive archive)
        {
            // json
            {
                using (var stream = archive.CreateEntry($"{RoleDir}{BcDocument.PathSep}{Id}.json", CompressionLevel.Fastest).Open())
                {
                    using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
                    {
                        json.WriteStartObject();
                        json.WriteString("id", Id);
                        json.WriteString("name", Name);
                        json.WriteString("team", BcTeam.ToString(Team));
                        json.WriteStartArray("reminders");
                        foreach (var reminder in reminderTokens)
                        {
                            json.WriteStringValue(reminder);
                        }
                        json.WriteEndArray();
                        json.WriteStartArray("globalReminders");
                        foreach (var reminder in globalReminderTokens)
                        {
                            json.WriteStringValue(reminder);
                        }
                        json.WriteEndArray();
                        json.WriteBoolean("setup", setup);
                        json.WriteString("ability", ability);
                        json.WriteNumber("firstNight", firstNightOrder);
                        json.WriteNumber("otherNight", otherNightOrder);
                        json.WriteString("firstNightReminder", firstNightReminder);
                        json.WriteString("otherNightReminder", otherNightReminder);
                        json.WriteEndObject();
                        json.Flush();
                    }
                }
            }

            // source image
            if (SourceImage != null)
            {
                using (var stream = archive.CreateEntry($"{SourceImageDir}{BcDocument.PathSep}{Id}.png", CompressionLevel.Fastest).Open())
                {
                    SourceImage.Save(stream, ImageFormat.Png);
                }
            }

            // processed image
            if (ProcessedImage != null)
            {
                using (var stream = archive.CreateEntry($"{ProcessedImageDir}{BcDocument.PathSep}{Id}.png", CompressionLevel.Fastest).Open())
                {
                    ProcessedImage.Save(stream, ImageFormat.Png);
                }
            }
        }
    }
}
