using SixLabors.ImageSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

namespace BloodstarClocktica
{
    class SaveRole
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public SaveTeam.TeamValue Team { get; set; }
        public Image SrcImage { get; set; }
        public Image ProcessedImage { get; set; }
        public List<string> ReminderTokens { get; set; }
        public bool Setup { get; set; }
        public string Ability { get; set; }

        public SaveRole()
        {
            Id = "new_character";
            Name = "New Character";
            ReminderTokens = new List<string>();
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
                        json.WriteStartArray("reminder_tokens");
                        foreach (var reminder in ReminderTokens)
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
            if (SrcImage != null)
            {
                using (var stream = archive.CreateEntry($"{SaveFile.SourceImageDir}{SaveFile.PathSep}{Id}.png").Open())
                {
                    SrcImage.SaveAsPng(stream);
                }
            }

            // processed image
            if (ProcessedImage != null)
            {
                using (var stream = archive.CreateEntry($"{SaveFile.ProcessedImageDir}{SaveFile.PathSep}{Id}.png").Open())
                {
                    ProcessedImage.SaveAsPng(stream);
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
                            case "reminder_tokens":
                                var list = new List<string>();
                                if (json.TokenType != JsonTokenType.StartArray) { throw new BcLoadException("Expected an array for reminder_tokens"); }
                                json.Read();
                                while (json.TokenType != JsonTokenType.EndArray)
                                {
                                    list.Add(json.GetString());
                                    json.Read();
                                }
                                role.ReminderTokens = list;
                                break;
                            case "setup":
                                role.Setup = json.GetBoolean();
                                break;
                            case "ability":
                                role.Ability = json.GetString();
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
                    role.SrcImage = Image.Load(stream);
                }
            }

            // processed image
            if (processedImageEntry != null)
            {
                using (var stream = processedImageEntry.Open())
                {
                    role.ProcessedImage = Image.Load(stream);
                }
            }

            return role;
        }
    }
}
