﻿using System;
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

        /// <summary>
        /// The displayed ability text of the character
        /// </summary>
        public string Ability { get; set; }

        /// <summary>
        /// Reminder tokens for this character
        /// </summary>
        public IEnumerable<string> ReminderTokens { get; set; }

        /// <summary>
        /// Reminder tokens for everybody
        /// </summary>
        public IEnumerable<string> GlobalReminderTokens { get; set; }

        /// <summary>
        /// hether this token affects setup (orange leaf), like the Drunk or Baron
        /// </summary>
        public bool Setup { get; set; }

        private int firstNightOrder;

        private int otherNightOrder;

        /// <summary>
        /// Reminder text for first night
        /// </summary>
        public string FirstNightReminder { get; set; }

        /// <summary>
        /// Reminder text for other nights
        /// </summary>
        public string OtherNightReminder { get; set; }

        public Image SourceImage { get; set; }

        public string SourceImageButtonText
        {
            get
            {
                if (SourceImage == null)
                {
                    return "Click to import source image";
                }
                return "";
            }
        }

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
            ReminderTokens = new BindingList<string>();
            GlobalReminderTokens = new BindingList<string>();
            Setup = false;
            Ability = "";
            firstNightOrder = 0;
            otherNightOrder = 0;
            FirstNightReminder = "";
            OtherNightReminder = "";
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
                                    this.ReminderTokens = list;
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
                                    this.GlobalReminderTokens = list;
                                }
                                break;
                            case "setup":
                                this.Setup = json.GetBoolean();
                                break;
                            case "ability":
                                this.Ability = json.GetString();
                                break;
                            case "firstNight":
                                this.firstNightOrder = json.GetInt32();
                                break;
                            case "otherNight":
                                this.otherNightOrder = json.GetInt32();
                                break;
                            case "firstNightReminder":
                                this.FirstNightReminder = json.GetString();
                                break;
                            case "otherNightReminder":
                                this.OtherNightReminder = json.GetString();
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
                        json.WriteString("team", BcTeam.ToSaveString(Team));
                        json.WriteStartArray("reminders");
                        foreach (var reminder in ReminderTokens)
                        {
                            json.WriteStringValue(reminder);
                        }
                        json.WriteEndArray();
                        json.WriteStartArray("globalReminders");
                        foreach (var reminder in GlobalReminderTokens)
                        {
                            json.WriteStringValue(reminder);
                        }
                        json.WriteEndArray();
                        json.WriteBoolean("setup", Setup);
                        json.WriteString("ability", Ability);
                        json.WriteNumber("firstNight", firstNightOrder);
                        json.WriteNumber("otherNight", otherNightOrder);
                        json.WriteString("firstNightReminder", FirstNightReminder);
                        json.WriteString("otherNightReminder", OtherNightReminder);
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
