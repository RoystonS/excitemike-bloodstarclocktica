using System;
using System.IO;
using System.IO.Compression;
using System.Text.Json;
using System.Drawing;
using System.Drawing.Imaging;

namespace BloodstarClockticaLib
{
    public class BcMeta
    {
        internal static string MetaFile = "meta.json";
        internal static string LogoFile = "logo.png";

        /// <summary>
        /// name of the custom edition
        /// </summary>
        public string Name
        {
            get => name;
            set
            {
                name = value;
            }
        }
        private string name;

        /// <summary>
        /// author credit for this edition
        /// </summary>
        public string Author
        {
            get => author;
            set
            {
                author = value;
            }
        }
        private string author;

        /// <summary>
        /// logo image for this edition
        /// </summary>
        public Image Logo { get; set; }

        /// <summary>
        /// url root for links to uploaded files
        /// </summary>
        public string UrlRoot { get; set; }

        /// <summary>
        /// remember where we last exported to
        /// </summary>
        public string ExportToDiskPath { get; set; }

        /// <summary>
        /// remote directory to upload to
        /// </summary>
        public string SftpRemoteDirectory { get; set; }

        /// <summary>
        /// host to upload to
        /// </summary>
        public string SftpHost { get; set; }
        public string SftpUser { get; set; }
        public int SftpPort { get; set; }

        /// <summary>
        /// default metadata
        /// </summary>
        public BcMeta()
        {
            SetDefaults();
        }

        private void SetDefaults()
        {
            name = "New Edition";
            author = "Your Name Here";
            Logo = null;
            UrlRoot = "";
            SftpRemoteDirectory = "REPLACE_THIS";
            SftpHost = "ftp.excitemike.com";
            SftpUser = "botc_homebrew";
            SftpPort = 2222;
            ExportToDiskPath = null;
        }

        /// <summary>
        /// metadata loaded from archive
        /// </summary>
        /// <param name="archive"></param>
        internal BcMeta(ZipArchive archive)
        {
            SetDefaults();
            var jsonEntry = archive.GetEntry(MetaFile);
            var logoEntry = archive.GetEntry(LogoFile);

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
                                this.name = json.GetString();
                                break;
                            case "author":
                                this.author = json.GetString();
                                break;
                            case "urlRoot":
                                var urlRoot = json.GetString();
                                if ("" != urlRoot)
                                {
                                    this.UrlRoot = urlRoot;
                                }
                                break;
                            case "exportToDiskPath":
                                {
                                    var path = json.GetString();
                                    if ("" != path)
                                    {
                                        this.ExportToDiskPath = path;
                                    }
                                }
                                break;
                            case "sftpRemoteDirectory":
                                var remoteDirectory = json.GetString();
                                if ("" != remoteDirectory)
                                {
                                    this.SftpRemoteDirectory = remoteDirectory;
                                }
                                break;
                            case "sftpHost":
                                this.SftpHost = json.GetString();
                                break;
                            case "sftpPort":
                                this.SftpPort = json.GetInt32();
                                break;
                            case "sftpUser":
                                this.SftpUser = json.GetString();
                                break;
                        }
                    }
                }
            }

            // logo
            if (logoEntry != null)
            {
                using (var stream = logoEntry.Open())
                {
                    this.Logo = Image.FromStream(stream);
                }
            }
        }

        /// <summary>
        /// write the metadata to the archive
        /// </summary>
        /// <param name="archive"></param>
        public void Save(ZipArchive archive)
        {
            // json
            {
                using (var stream = archive.CreateEntry(MetaFile, CompressionLevel.Fastest).Open())
                {
                    using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
                    {
                        json.WriteStartObject();
                        json.WriteString("name", name);
                        json.WriteString("author", author);
                        json.WriteString("exportToDiskPath", ExportToDiskPath);
                        json.WriteString("urlRoot", UrlRoot);
                        json.WriteString("sftpRemoteDirectory", SftpRemoteDirectory);
                        json.WriteString("sftpHost", SftpHost);
                        json.WriteNumber("sftpPort", SftpPort);
                        json.WriteString("sftpUser", SftpUser);
                        json.WriteEndObject();
                        json.Flush();
                    }
                }
            }

            // logo
            if (Logo != null)
            {
                using (var stream = archive.CreateEntry(LogoFile, CompressionLevel.Fastest).Open())
                {
                    Logo.Save(stream, ImageFormat.Png);
                }
            }
        }
    }
}
