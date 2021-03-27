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
    public class BcCharacter : ICharacterInterface
    {
        internal static string RoleDir = "roles";
        internal static string SourceImageDir = "src_images";
        internal static string ProcessedImageDir = "processed_images";

        /// <summary>
        /// the internal ID for this character, without spaces or special characters
        /// </summary>
        public string Id
        {
            get => id;
            set
            {
                if (value != id)
                {
                    id = value;
                    ImageUploaded = false;
                }
            }
        }
        private string id;

        /// <summary>
        /// the displayed name of this character
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// which category of character it is
        /// </summary>
        public BcTeam.TeamValue Team
        {
            get => team;
            set
            {
                if (value != team)
                {
                    team = value;
                    ImageUploaded = false;
                }
            }
        }
        private BcTeam.TeamValue team;

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
        /// whether this token affects setup (orange leaf), like the Drunk or Baron
        /// </summary>
        public bool Setup { get; set; }

        /// <summary>
        /// The position that this character acts on the first / other nights, compared to all other characters
        /// </summary>
        public int FirstNightOrder { get; set; }

        /// <summary>
        /// The position that this character acts on the first / other nights, compared to all other characters
        /// </summary>
        public int OtherNightOrder { get; set; }

        /// <summary>
        /// Reminder text for first night
        /// </summary>
        public string FirstNightReminder { get; set; }

        /// <summary>
        /// Reminder text for other nights
        /// </summary>
        public string OtherNightReminder { get; set; }

        /// <summary>
        /// source image to be processed into botc-style character token art
        /// </summary>
        public Image SourceImage
        {
            get => sourceImage;
            set
            {
                sourceImage = value;
                ImageUploaded = false;
            }
        }
        private Image sourceImage;

        /// <summary>
        /// backing field for ProcessedImage
        /// </summary>
        private Image processedImage;

        /// <summary>
        /// character image, lazily created from source image if needed/possible
        /// </summary>
        public Image ProcessedImage
        {
            get
            {
                if (processedImage != null) { return processedImage; }
                if (null == SourceImage) { return null; }
                ReprocessImage();
                return processedImage;
            }
            set
            {
                processedImage = value;
                ImageUploaded = false;
            }
        }

        /// <summary>
        /// whether we think the copy on the server is up to date
        /// </summary>
        internal bool ImageUploaded { get; set; }

        /// <summary>
        /// whether to export this character or leave it in set, unexported
        /// </summary>
        public bool IncludeInExport { get; set; }

        /// <summary>
        /// Note to display with the character in Bloodstar Clocktica
        /// </summary>
        public string Note { get; set; }

        /// <summary>
        /// unused by clocktower.online, but included in exported JSON. Good place to give credit to image creator, for example.
        /// </summary>
        public string Attribution { get; set; }

        /// <summary>
        /// Group the almanac-specific fields
        /// </summary>
        public BcCharacterAlmanacEntry AlmanacEntry { get; }

        /// <summary>
        /// Get a unique character id
        /// </summary>
        /// <returns></returns>
        internal static string UniqueCharacterId(BcDocument document, string baseId)
        {
            var prefix = baseId;
            if (document != null)
            {
                var n = 1;
                while (!document.IsIdAvailable($"{prefix}{n}", -1))
                {
                    n++;
                }
                return $"{prefix}{n}";
            }
            return baseId;
        }

        /// <summary>
        /// create default character
        /// </summary>
        public BcCharacter() : this(null)
        {
            AlmanacEntry = new BcCharacterAlmanacEntry();
        }

        /// <summary>
        /// create default character
        /// </summary>
        public BcCharacter(BcDocument document)
        {
            id = UniqueCharacterId(document, "newcharacter");
            Name = "New Character";
            team = BcTeam.TeamValue.Townsfolk;
            ReminderTokens = new BindingList<string>();
            GlobalReminderTokens = new BindingList<string>();
            Setup = false;
            Ability = "";
            FirstNightOrder = 0;
            OtherNightOrder = 0;
            FirstNightReminder = "";
            OtherNightReminder = "";
            sourceImage = null;
            processedImage = null;
            IncludeInExport = true;
            Note = "";
            ImageUploaded = false;
            Attribution = "";
            AlmanacEntry = new BcCharacterAlmanacEntry();
        }

        /// <summary>
        /// read character from archive
        /// </summary>
        /// <param name="archive"></param>
        /// <param name="id"></param>
        public BcCharacter(BcDocument document, ZipArchive archive, string id) : this(document)
        {
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
                                this.id = json.GetString();
                                break;
                            case "name":
                                this.Name = json.GetString();
                                break;
                            case "team":
                                team = BcTeam.FromString(json.GetString());
                                break;
                            case "reminders":
                                {
                                    var list = new BindingList<string>();
                                    if (json.TokenType != JsonTokenType.StartArray) { throw new Exception("Expected an array for reminders"); }
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
                                    if (json.TokenType != JsonTokenType.StartArray) { throw new Exception("Expected an array for globalReminders"); }
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
                                this.FirstNightOrder = json.GetInt32();
                                break;
                            case "otherNight":
                                this.OtherNightOrder = json.GetInt32();
                                break;
                            case "firstNightReminder":
                                this.FirstNightReminder = json.GetString();
                                break;
                            case "otherNightReminder":
                                this.OtherNightReminder = json.GetString();
                                break;
                            case "includeInExport":
                                IncludeInExport = json.GetBoolean();
                                break;
                            case "note":
                                Note = json.GetString();
                                break;
                            case "imageUploaded":
                                ImageUploaded = json.GetBoolean();
                                break;
                            case "attribution":
                                Attribution = json.GetString();
                                break;
                            case "almanacEntry":
                                AlmanacEntry = new BcCharacterAlmanacEntry(json);
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
                    sourceImage = Image.FromStream(stream);
                }
            }

            // processed image
            if (processedImageEntry != null)
            {
                using (var stream = processedImageEntry.Open())
                {
                    processedImage = Image.FromStream(stream);
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
                        json.WriteString("team", BcTeam.ToExportString(Team));
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
                        json.WriteNumber("firstNight", FirstNightOrder);
                        json.WriteNumber("otherNight", OtherNightOrder);
                        json.WriteString("firstNightReminder", FirstNightReminder);
                        json.WriteString("otherNightReminder", OtherNightReminder);
                        json.WriteBoolean("includeInExport", IncludeInExport);
                        json.WriteString("note", Note);
                        json.WriteBoolean("imageUploaded", ImageUploaded);
                        if (!string.IsNullOrWhiteSpace(Attribution))
                        {
                            json.WriteString("attribution", Attribution);
                        }
                        AlmanacEntry.Save(json, "almanacEntry");
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

        /// <summary>
        /// regenerate processed image
        /// </summary>
        private void ReprocessImage()
        {
            processedImage = BcImage.ProcessImage(SourceImage, BcImage.GetGradientForTeam(Team));
            ImageUploaded = false;
        }

        /// <summary>
        /// see if the character contains that text somewhere
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public bool PassesFilter(string s)
        {
            var needle = s.ToLower();
            if (string.IsNullOrWhiteSpace(s))
            {
                return true;
            }
            var haystacks = new string[] {
                    Id,
                    Name,
                    BcTeam.ToExportString(Team),
                    Ability,
                    string.Join("\n", ReminderTokens),
                    string.Join("\n", GlobalReminderTokens),
                    FirstNightReminder,
                    OtherNightReminder,
                    Note,
                    Attribution};
            foreach (var haystack in haystacks)
            {
                if (haystack.ToLower().Contains(needle))
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// create a copy of this character
        /// </summary>
        /// <returns></returns>
        public BcCharacter Clone(BcDocument document)
        {
            return new BcCharacter
            {
                Id = UniqueCharacterId(document, this.Id),
                Name = Name,
                Team = Team,
                Ability = Ability,
                ReminderTokens = new List<string>(ReminderTokens),
                GlobalReminderTokens = new List<string>(GlobalReminderTokens),
                Setup = Setup,
                FirstNightOrder = FirstNightOrder,
                FirstNightReminder = FirstNightReminder,
                OtherNightOrder = OtherNightOrder,
                OtherNightReminder = OtherNightReminder,
                SourceImage = SourceImage,
                ProcessedImage = ProcessedImage,
                Note = Note,
                IncludeInExport = true,
                ImageUploaded = false,
                Attribution = Attribution
            };
        }
    }
}
