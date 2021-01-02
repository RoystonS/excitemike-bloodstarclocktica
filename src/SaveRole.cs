using System;
using System.ComponentModel;
using System.ComponentModel.Design;
using System.Drawing;
using System.Drawing.Design;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

namespace BloodstarClocktica
{
    [DefaultProperty("Id")]
    public class SaveRole
    {
        [Category("Character"), Description("The internal ID for this character, without spaces or special characters.")]
        public string Id { get; set; }

        [Category("Character"), Description("The displayed ability text of the character.")]
        [Editor(typeof(MultilineStringEditor), typeof(UITypeEditor))]
        public string Ability { get; set; }

        [Category("Character"), Description("The displayed name of the character.")]
        public string Name { get; set; }

        [Category("Character"), Description("The team of the character.")]
        public SaveTeam.TeamValue Team { get; set; }

        /// <summary>
        /// source character token image
        /// </summary>
        [Browsable(false)]
        public System.Drawing.Image SourceImage { get; set; }

        /// <summary>
        /// cached processed character token image
        /// </summary>
        [Browsable(false)]
        public System.Drawing.Image ProcessedImage { get; set; } // TODO: just-in-time generate processed image

        [Category("Reminders"), Description("Reminder tokens that are available if the character is assigned to a player.")]
        [Editor("System.Windows.Forms.Design.StringCollectionEditor, System.Design, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a", typeof(System.Drawing.Design.UITypeEditor))]
        public BindingList<string> ReminderTokens { get; set; }

        [Category("Reminders"), Description("Global reminder tokens that will always be available, no matter if the character is assigned to a player or not.")]
        [Editor("System.Windows.Forms.Design.StringCollectionEditor, System.Design, Version=2.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a", typeof(System.Drawing.Design.UITypeEditor))]
        public BindingList<string> GlobalReminderTokens { get; set; }

        [Category("Reminders"), Description("Whether this token affects setup (orange leaf), like the Drunk or Baron.")]
        public bool Setup { get; set; }

        /// <summary>
        /// create default SaveRole
        /// </summary>
        public SaveRole()
        {
            Id = "new_character";
            Ability = "";
            Name = "New Character";
            Team = SaveTeam.TeamValue.Townsfolk;
            SourceImage = null;
            ProcessedImage = null;
            ReminderTokens = new BindingList<string>();
            GlobalReminderTokens = new BindingList<string>();
        }

        /// <summary>
        /// Save the role's json file and associated images in the .zip
        /// </summary>
        /// <param name="archive"></param>
        public void Save(ZipArchive archive)
        {
            // TODO: check timestamps!

            // json
            {
                using (var stream = archive.CreateEntry($"{SaveFile.RoleDir}{SaveFile.PathSep}{Id}.json").Open())
                {
                    using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
                    {
                        json.WriteStartObject();
                        json.WriteString("id", Id);
                        json.WriteString("name", Name);
                        json.WriteString("team", SaveTeam.ToString(Team));
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
                        json.WriteEndObject();
                        json.Flush();
                    }
                }
            }

            // source image
            if (SourceImage != null)
            {
                using (var stream = archive.CreateEntry($"{SaveFile.SourceImageDir}{SaveFile.PathSep}{Id}.png").Open())
                {
                    SourceImage.Save(stream, ImageFormat.Png);
                }
            }

            // processed image
            if (ProcessedImage != null)
            {
                using (var stream = archive.CreateEntry($"{SaveFile.ProcessedImageDir}{SaveFile.PathSep}{Id}.png").Open())
                {
                    ProcessedImage.Save(stream, ImageFormat.Png);
                }
            }
        }

        /// <summary>
        /// Load the role from json/images from the .zip
        /// </summary>
        /// <param name="entry"></param>
        static public SaveRole Load(ZipArchiveEntry jsonEntry, ZipArchiveEntry srcImageEntry, ZipArchiveEntry processedImageEntry)
        {
            var role = new SaveRole();

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
                                role.Id = json.GetString();
                                break;
                            case "name":
                                role.Name = json.GetString();
                                break;
                            case "team":
                                role.Team = SaveTeam.FromString(json.GetString());
                                break;
                            case "reminders":
                                {
                                    var list = new BindingList<string>();
                                    if (json.TokenType != JsonTokenType.StartArray) { throw new BcLoadException("Expected an array for reminder_tokens"); }
                                    json.Read();
                                    while (json.TokenType != JsonTokenType.EndArray)
                                    {
                                        list.Add(json.GetString());
                                        json.Read();
                                    }
                                    role.ReminderTokens = list;
                                }
                                break;
                            case "globalReminders":
                                {
                                    var list = new BindingList<string>();
                                    if (json.TokenType != JsonTokenType.StartArray) { throw new BcLoadException("Expected an array for reminder_tokens"); }
                                    json.Read();
                                    while (json.TokenType != JsonTokenType.EndArray)
                                    {
                                        list.Add(json.GetString());
                                        json.Read();
                                    }
                                    role.GlobalReminderTokens = list;
                                }
                                break;
                            case "setup":
                                role.Setup = json.GetBoolean();
                                break;
                            case "ability":
                                role.Ability = json.GetString();
                                break;
                            default:
                                Console.Error.WriteLine($"unhandled property: \"{propertyName}\"");
                                json.Skip();
                                break;
                        }
                    }
                    else
                    {
                        throw new BcLoadException("Unhandled json token type");
                    }
                }
            }

            // source image
            if (srcImageEntry != null)
            {
                using (var stream = srcImageEntry.Open())
                {
                    role.SourceImage = Image.FromStream(stream);
                }
            }

            // processed image
            if (processedImageEntry != null)
            {
                using (var stream = processedImageEntry.Open())
                {
                    role.ProcessedImage = Image.FromStream(stream);
                }
            }

            return role;
        }
    }
}
