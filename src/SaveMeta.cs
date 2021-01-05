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
        private string _UrlRoot = "/";
        public string UrlRoot
        {
            get
            {
                return _UrlRoot;
            }
            set
            {
                if (value == null)
                {
                    _UrlRoot = "/";
                }
                else
                {
                    if (value.EndsWith("/"))
                    {
                        _UrlRoot = value;
                    }
                    else
                    {
                        _UrlRoot = value + "/";
                    }
                }
            }
        }
        private string _SftpRemoteDirectory = "/";
        public string SftpRemoteDirectory
        {
            get
            {
                return _SftpRemoteDirectory;
            }
            set
            {
                if (value == null)
                {
                    _SftpRemoteDirectory = "/";
                }
                else
                {
                    _SftpRemoteDirectory = value;
                    if (!_SftpRemoteDirectory.StartsWith("/"))
                    {
                        _SftpRemoteDirectory = "/" + _SftpRemoteDirectory;
                    }
                    if (!_SftpRemoteDirectory.EndsWith("/"))
                    {
                        _SftpRemoteDirectory += "/";
                    }
                }
            }
        }
        public string ImageUrlPrefix
        {
            get
            {
                return _UrlRoot + "images/";
            }
        }
        public string SftpRemoteImagesDirectory
        {
            get
            {
                return _SftpRemoteDirectory + "images/";
            }
        }
        public string ExportToDiskPath { get; set; }
        public string RolesUrl
        {
            get
            {
                return $"{UrlRoot}{SftpRemoteDirectory.Substring(1)}roles.json";
            }
        }
        public string SftpHost { get; set; }
        public string SftpUser { get; set; }
        public int SftpPort { get; set; }
        public static SaveMeta Default()
        {
            return new SaveMeta
            {
                Name = "Custom Edition",
                Author = "",
                Logo = null,
                UrlRoot = "https://meyermike.startlogic.com/botc",
                SftpRemoteDirectory = "REPLACE ME",
                ExportToDiskPath = Path.GetTempPath(),
                SftpHost = "ftp.excitemike.com",
                SftpPort = 2222,
                SftpUser = "botc_homebrew"
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
                using (var stream = archive.CreateEntry(SaveFile.MetaFile, CompressionLevel.Fastest).Open())
                {
                    using (Utf8JsonWriter json = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
                    {
                        json.WriteStartObject();
                        json.WriteString("name", Name);
                        json.WriteString("author", Author);
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
                using (var stream = archive.CreateEntry(SaveFile.LogoFile, CompressionLevel.Fastest).Open())
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
            var meta = Default();

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
                            case "urlRoot":
                                var urlRoot = json.GetString();
                                if ("" != urlRoot)
                                {
                                    meta.UrlRoot = urlRoot;
                                }
                                break;
                            case "exportToDiskPath":
                                {
                                    var path = json.GetString();
                                    if ("" != path)
                                    {
                                        meta.ExportToDiskPath = path;
                                    }
                                }
                                break;
                            case "sftpRemoteDirectory":
                                var remoteDirectory = json.GetString();
                                if ("" != remoteDirectory)
                                {
                                    meta.SftpRemoteDirectory = remoteDirectory;
                                }
                                break;
                            case "sftpHost":
                                meta.SftpHost = json.GetString();
                                break;
                            case "sftpPort":
                                meta.SftpPort = json.GetInt32();
                                break;
                            case "sftpUser":
                                meta.SftpUser = json.GetString();
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
