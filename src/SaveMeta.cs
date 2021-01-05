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
        private string _RemoteDirectory = "/";
        public string RemoteDirectory
        {
            get
            {
                return _RemoteDirectory;
            }
            set
            {
                if (value == null)
                {
                    _RemoteDirectory = "/";
                }
                else
                {
                    _RemoteDirectory = value;
                    if (!_RemoteDirectory.StartsWith("/"))
                    {
                        _RemoteDirectory = "/" + _RemoteDirectory;
                    }
                    if (!_RemoteDirectory.EndsWith("/"))
                    {
                        _RemoteDirectory += "/";
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
        public string RemoteImagesDirectory
        {
            get
            {
                return _RemoteDirectory + "images/";
            }
        }
        public string ExportToDiskPath { get; set; }
        public string RolesUrl
        {
            get
            {
                return $"{UrlRoot}{RemoteDirectory.Substring(1)}roles.json";
            }
        }
        public static SaveMeta Default()
        {
            return new SaveMeta
            {
                Name = "New Edition",
                Author = "",
                Logo = null,
                UrlRoot = "https://example.com/",
                RemoteDirectory = "/botc/",
                ExportToDiskPath = Path.GetTempPath()
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
                        json.WriteString("urlRoot", UrlRoot);
                        json.WriteString("remoteDirectory", RemoteDirectory);
                        json.WriteString("exportToDiskPath", ExportToDiskPath);
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
                            case "remoteDirectory":
                                var remoteDirectory = json.GetString();
                                if ("" != remoteDirectory)
                                {
                                    meta.RemoteDirectory = remoteDirectory;
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
