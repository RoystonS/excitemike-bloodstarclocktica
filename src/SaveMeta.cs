using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

namespace BloodstarClocktica
{
    public class SaveMeta
    {
        public string Name { get; set; }
        public string Author { get; set; }
        public Image Logo { get; set; }
        public static SaveMeta Default()
        {
            return new SaveMeta
            {
                Name = "New Edition",
                Author = "",
                Logo = null,
            };
        }

        /// <summary>
        /// write the metadata to the archive
        /// </summary>
        /// <param name="archive"></param>
        public void Save(ZipArchive archive)
        {
            // json
            {
                using (var stream = archive.CreateEntry(SaveFile.MetaFile).Open())
                {
                    using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
                    {
                        json.WriteStartObject();
                        json.WriteString("name", Name);
                        json.WriteString("author", Author);
                        json.WriteEndObject();
                        json.Flush();
                    }
                }
            }

            // logo
            if (Logo != null)
            {
                using (var stream = archive.CreateEntry(SaveFile.LogoFile).Open())
                {
                    Logo.Save(stream, ImageFormat.Png);
                }
            }
        }

        /// <summary>
        /// read from archive entries
        /// </summary>
        /// <param name="jsonEntry"></param>
        /// <param name="logoEntry"></param>
        /// <returns></returns>
        public static SaveMeta Load(ZipArchiveEntry jsonEntry, ZipArchiveEntry logoEntry)
        {
            var meta = new SaveMeta();

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
                            case "name":
                                meta.Name = json.GetString();
                                break;
                            case "author":
                                meta.Author = json.GetString();
                                break;
                        }
                    }
                    else
                    {
                        throw new BC.LoadException("Unhandled json token type");
                    }
                }
            }

            // logo
            if (logoEntry != null)
            {
                using (var stream = logoEntry.Open())
                {
                    meta.Logo = Image.FromStream(stream);
                }
            }

            return meta;
        }
    }
}
