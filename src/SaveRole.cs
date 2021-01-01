using SixLabors.ImageSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing.Design;
using System.IO;
using System.IO.Compression;
using System.Text.Json;
using System.Windows.Forms;
using System.Windows.Forms.Design;

namespace BloodstarClocktica
{
    /// <summary>
    /// wrap SixLabors.ImageSharp.Image so we can add attributes, so we can pick images from PropertyGrid
    /// </summary>
    [Editor(typeof(SaveImageEditor), typeof(UITypeEditor)), TypeConverter(typeof(ExpandableObjectConverter))]
    class SaveImage
    {
        public Image SrcImage { get; set; }
        public Image ProcessedImage { get; set; }
        public SaveImage(Image srcImage, Image processedImage)
        {
            SrcImage = srcImage;
            ProcessedImage = processedImage;
        }
    }

    /// <summary>
    /// editor for picking images from PropertyGrid
    /// </summary>
    class SaveImageEditor : UITypeEditor
    {
        public override UITypeEditorEditStyle GetEditStyle(ITypeDescriptorContext context)
        {
            return UITypeEditorEditStyle.Modal;
        }
        public override object EditValue(ITypeDescriptorContext context, System.IServiceProvider provider, object value)
        {
            if (value is SaveImage saveImage)
            {
                if (provider.GetService(typeof(IWindowsFormsEditorService)) is IWindowsFormsEditorService svc)
                {
                    using (var form = new TokenImageForm())
                    {
                        form.SrcImage = saveImage.SrcImage;
                        if ((svc.ShowDialog(form) == DialogResult.OK) && (form.SrcImage != saveImage.SrcImage))
                        {
                            saveImage.SrcImage = form.SrcImage;
                            saveImage.ProcessedImage = form.ProcessedImage;
                            BC.Document.Dirty = true;
                        }
                    }
                }
                return value;
            }
            else
            {
                throw new BcDataException($"SaveImageEditor used with invalid type");
            }
        }
    }

    [DefaultProperty("Id")]
    class SaveRole
    {
        [Category("Character"), Description("The internal ID for this character, without spaces or special characters.")]
        public string Id { get; set; }

        [Category("Character"), Description("The displayed ability text of the character.")]
        public string Ability { get; set; }

        [Category("Character"), Description("The displayed name of the character.")]
        public string Name { get; set; }

        [Category("Character"), Description("The team of the character.")]
        public SaveTeam.TeamValue Team { get; set; }
        
        [Category("Character"), Description("Image for character token.")]
        public SaveImage TokenImage { get; set; }

        [Category("Character"), Description("Reminder tokens that are available if the character is assigned to a player.")]
        public List<string> ReminderTokens { get; set; }

        [Category("Character"), Description("Global reminder tokens that will always be available, no matter if the character is assigned to a player or not.")]
        public List<string> GlobalReminderTokens { get; set; }

        [Category("Character"), Description("Whether this token affects setup (orange leaf), like the Drunk or Baron.")]
        public bool Setup { get; set; }

        public SaveRole()
        {
            Id = "new_character";
            Ability = "";
            Name = "New Character";
            Team = SaveTeam.TeamValue.Townsfolk;
            TokenImage = new SaveImage(null, null);
            ReminderTokens = new List<string>();
            GlobalReminderTokens = new List<string>();
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

            if (TokenImage != null)
            {
                // source image
                if (TokenImage.SrcImage != null)
                {
                    using (var stream = archive.CreateEntry($"{SaveFile.SourceImageDir}{SaveFile.PathSep}{Id}.png").Open())
                    {
                        TokenImage.SrcImage.SaveAsPng(stream);
                    }
                }

                // processed image
                if (TokenImage.ProcessedImage != null)
                {
                    using (var stream = archive.CreateEntry($"{SaveFile.ProcessedImageDir}{SaveFile.PathSep}{Id}.png").Open())
                    {
                        TokenImage.ProcessedImage.SaveAsPng(stream);
                    }
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
                                    var list = new List<string>();
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
                                    var list = new List<string>();
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
                    role.TokenImage.SrcImage = Image.Load(stream);
                }
            }

            // processed image
            if (processedImageEntry != null)
            {
                using (var stream = processedImageEntry.Open())
                {
                    role.TokenImage.ProcessedImage = Image.Load(stream);
                }
            }

            return role;
        }
    }
}
