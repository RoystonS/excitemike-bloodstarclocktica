using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

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
                LogoUploaded = false;
            }
        }
        private Image logo;

        /// <summary>
        /// Whether we think the server has an up to date version of the logo.
        /// </summary>
        internal bool LogoUploaded { get; set; }

        /// <summary>
        /// Whether we think the server has an up to date version of the almanac images.
        /// </summary>
        internal bool AlmanacImagesUploaded { get; set; }

        /// <summary>
        /// url root for links to uploaded files
        /// </summary>
        public string UrlRoot { get; set; }

        /// <summary>
        /// prefix applied to image paths used when exporting to disk. e.g. "https://example.com/botc/SETNAME/images/"
        /// </summary>
        public string ExportToDiskImageUrlPrefix { get; set; }

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

        /// <summary>
        /// username for sftp connection
        /// </summary>
        public string SftpUser { get; set; }

        /// <summary>
        /// port for sftp connection
        /// </summary>
        public int SftpPort { get; set; }

        /// <summary>
        /// whether to skip already-uploaded images during exports
        /// </summary>
        public bool SkipUnchanged { get; set; }

        /// <summary>
        /// setting of last successful upload
        /// </summary>
        internal string PrevSftpHost { get; set; }

        /// <summary>
        /// setting of last successful upload
        /// </summary>
        internal string PrevSftpRemoteDirectory { get; set; }

        /// <summary>
        /// setting of last successful upload
        /// </summary>
        internal int PrevSftpPort { get; set; }

        /// <summary>
        /// setting of last successful upload
        /// </summary>
        internal string PrevSftpUser { get; set; }

        /// <summary>
        /// Intro text for the set's Almanac. For Trouble Brewing, this started like "Clouds roll in over Ravenswood Bluff..."
        /// </summary>
        public string Synopsis { get; set; }

        /// <summary>
        /// Almanac's description of the custom edition as a whole.
        /// </summary>
        public string Overview { get; set; }

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
            ExportToDiskImageUrlPrefix = null;
            SkipUnchanged = true;
            PrevSftpHost = "";
            PrevSftpRemoteDirectory = "";
            PrevSftpPort = -1;
            PrevSftpUser = "";
            LogoUploaded = false;
            Synopsis = "";
            Overview = "";
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
                            case "exportToDiskImageUrlPrefix":
                                this.ExportToDiskImageUrlPrefix = json.GetString();
                                break;
                            case "skipUnchanged":
                                SkipUnchanged = json.GetBoolean();
                                break;
                            case "prevSftpHost":
                                PrevSftpHost = json.GetString();
                                break;
                            case "prevSftpRemoteDirectory":
                                PrevSftpRemoteDirectory = json.GetString();
                                break;
                            case "prevSftpPort":
                                PrevSftpPort = json.GetInt32();
                                break;
                            case "prevSftpUser":
                                PrevSftpUser = json.GetString();
                                break;
                            case "logoUploaded":
                                LogoUploaded = json.GetBoolean();
                                break;
                            case "almanacImagesUploaded":
                                AlmanacImagesUploaded = json.GetBoolean();
                                break;
                            case "synopsis":
                                Synopsis = json.GetString();
                                break;
                            case "overview":
                                Overview = json.GetString();
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
                    logo = Image.FromStream(stream);
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
                        json.WriteString("exportToDiskImageUrlPrefix", ExportToDiskImageUrlPrefix);
                        json.WriteBoolean("skipUnchanged", SkipUnchanged);
                        json.WriteString("prevSftpHost", PrevSftpHost);
                        json.WriteString("prevSftpRemoteDirectory", PrevSftpRemoteDirectory);
                        json.WriteNumber("prevSftpPort", PrevSftpPort);
                        json.WriteString("prevSftpUser", PrevSftpUser);
                        json.WriteBoolean("logoUploaded", LogoUploaded);
                        json.WriteBoolean("almanacImagesUploaded", AlmanacImagesUploaded);
                        json.WriteString("synopsis", Synopsis);
                        json.WriteString("overview", Overview);
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
