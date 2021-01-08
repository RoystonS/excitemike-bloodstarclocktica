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
        public Image Logo
        {
            get => logo;
            set
            {
                logo = value;
            }
        }
        private Image logo;

        /// <summary>
        /// url root for links to uploaded files
        /// </summary>
        public string UrlRoot => urlRoot;
        private string urlRoot;

        private string sftpRemoteDirectory;
        private string sftpHost;
        private string sftpUser;
        private int sftpPort;
        private string exportToDiskPath;

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
            logo = null;
            urlRoot = "https://meyermike.startlogic.com/botc";
            sftpRemoteDirectory = "REPLACE ME";
            sftpHost = "ftp.excitemike.com";
            sftpUser = "botc_homebrew";
            sftpPort = 2222;
            exportToDiskPath = null;
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
                                    this.urlRoot = urlRoot;
                                }
                                break;
                            case "exportToDiskPath":
                                {
                                    var path = json.GetString();
                                    if ("" != path)
                                    {
                                        this.exportToDiskPath = path;
                                    }
                                }
                                break;
                            case "sftpRemoteDirectory":
                                var remoteDirectory = json.GetString();
                                if ("" != remoteDirectory)
                                {
                                    this.sftpRemoteDirectory = remoteDirectory;
                                }
                                break;
                            case "sftpHost":
                                this.sftpHost = json.GetString();
                                break;
                            case "sftpPort":
                                this.sftpPort = json.GetInt32();
                                break;
                            case "sftpUser":
                                this.sftpUser = json.GetString();
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
                    this.logo = Image.FromStream(stream);
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
                        json.WriteString("exportToDiskPath", exportToDiskPath);
                        json.WriteString("urlRoot", urlRoot);
                        json.WriteString("sftpRemoteDirectory", sftpRemoteDirectory);
                        json.WriteString("sftpHost", sftpHost);
                        json.WriteNumber("sftpPort", sftpPort);
                        json.WriteString("sftpUser", sftpUser);
                        json.WriteEndObject();
                        json.Flush();
                    }
                }
            }

            // logo
            if (logo != null)
            {
                using (var stream = archive.CreateEntry(LogoFile, CompressionLevel.Fastest).Open())
                {
                    logo.Save(stream, ImageFormat.Png);
                }
            }
        }
    }
}
