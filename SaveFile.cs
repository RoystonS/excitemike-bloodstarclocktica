using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text.Json;

namespace BloodstarClocktica
{
    [Serializable]
    struct NightOrderItem
    {
        readonly string id;
        readonly string reminder;
    }

    class SaveFile
    {
        public static string RoleDir = "roles";
        public static string SourceImageDir = "src_images";
        public static string ProcessedImageDir = "processed_images";
        public static string PathSep = "/";
        public static string MetaFile = "meta.json";
        public static string FirstNightFile = "FirstNight.json";
        public static string OtherNightsFile = "OtherNights.json";
        public static string LogoFile = "logo.png";

        /// <summary>
        /// Last save/load location
        /// </summary>
        public string FilePath { get; set; }

        /// <summary>
        /// whether a save is needed
        /// </summary>
        public bool Dirty { get; set; }

        /// <summary>
        /// information about the set itself
        /// </summary>
        public SaveMeta Meta { get; set; }

        /// <summary>
        /// information on roles in the game
        /// </summary>
        public List<SaveRole> Roles { get; set; }

        /// <summary>
        /// what happens at night, in what order
        /// </summary>
        List<NightOrderItem> FirstNightOrder;

        /// <summary>
        /// what happens at night, in what order
        /// </summary>
        List<NightOrderItem> OtherNightsOrder;

        /// <summary>
        ///  create brand new SaveFile
        /// </summary>
        public SaveFile()
        {
            FilePath = string.Empty;
            Dirty = true;
            Meta = SaveMeta.Default();
            Roles = new List<SaveRole>();
            FirstNightOrder = new List<NightOrderItem>();
            OtherNightsOrder = new List<NightOrderItem>();
        }

        /// <summary>
        /// create from loaded file
        /// </summary>
        protected SaveFile(
            string filePath,
            SaveMeta meta,
            List<SaveRole> roles,
            List<NightOrderItem> firstNightOrder,
            List<NightOrderItem> otherNightsOrder
            )
        {
            FilePath = filePath;
            Dirty = false;
            Meta = meta;
            Roles = roles;
            FirstNightOrder = firstNightOrder;
            OtherNightsOrder = otherNightsOrder;
        }

        /// <summary>
        /// load SaveFile from disk
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static SaveFile Load(String filePath)
        {
            var archive = ZipFile.Open(filePath, ZipArchiveMode.Read);
            return new SaveFile(
                filePath,
                LoadMetadata(archive),
                LoadRoles(archive),
                LoadFirstNightOrder(archive),
                LoadOtherNightsOrder(archive)
           );
        }

        /// <summary>
        /// save to zip file
        /// </summary>
        /// <param name="path"></param>
        public void Save(String path)
        {
            FilePath = path;
            using (Stream stream = new FileStream(path, FileMode.Create, FileAccess.Write))
            {
                using (ZipArchive archive = new ZipArchive(stream, ZipArchiveMode.Create))
                {
                    SaveMetadata(archive);
                    SaveRoles(archive);
                    SaveFirstNightOrder(archive);
                    SaveOtherNightsOrder(archive);
                }
            }
            Dirty = false;
        }

        /// <summary>
        /// helper for Save. Save the "meta" json file in the .zip
        /// </summary>
        /// <param name="archive"></param>
        protected void SaveMetadata(ZipArchive archive)
        {
            // TODO: check timestamps!
            Meta.Save(archive);
        }

        /// <summary>
        /// helper for Load. Load the "meta" json file from the .zip
        /// </summary>
        /// <param name="archive"></param>
        protected static SaveMeta LoadMetadata(ZipArchive archive)
        {
            var jsonEntry = archive.GetEntry(MetaFile);
            var logoEntry = archive.GetEntry(LogoFile);
            return SaveMeta.Load(jsonEntry, logoEntry);
        }

        /// <summary>
        /// helper for Save. Save each role's json file and associated images in the .zip
        /// </summary>
        /// <param name="archive"></param>
        protected void SaveRoles(ZipArchive archive)
        {
            // TODO: check timestamps!
            foreach (var role in Roles)
            {
                role.Save(archive);
            }
        }

        /// <summary>
        /// load role information from the .zip
        /// </summary>
        /// <param name="archive"></param>
        /// <returns></returns>
        protected static List<SaveRole> LoadRoles(ZipArchive archive)
        {
            var list = new List<SaveRole>();
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                if (entry.FullName.StartsWith($"{RoleDir}{PathSep}"))
                {
                    var id = entry.Name.Split(new char[] { '.' }, 1)[0];
                    var srcImageEntry = archive.GetEntry($"{SourceImageDir}{PathSep}{id}.png");
                    var processedImageEntry = archive.GetEntry($"{ProcessedImageDir}{PathSep}{id}.png");
                    SaveRole.Load(entry, srcImageEntry, processedImageEntry);
                }
            }
            return list;
        }

        /// <summary>
        /// helper for Save. Save who acts in what order, with what reminders for the first night.
        /// </summary>
        /// <param name="archive"></param>
        protected void SaveFirstNightOrder(ZipArchive archive)
        {
            var entry = archive.CreateEntry(FirstNightFile);
            using (var stream = entry.Open())
            {
                var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true });
                JsonSerializer.Serialize(writer, FirstNightOrder, new JsonSerializerOptions { WriteIndented = true });
            }
        }

        /// <summary>
        /// Load who acts in what order, with what reminders for the first night.
        /// </summary>
        /// <param name="archive"></param>
        protected static List<NightOrderItem> LoadFirstNightOrder(ZipArchive archive)
        {
            var entry = archive.GetEntry(FirstNightFile);
            using (var stream = entry.Open())
            {
                var ms = new MemoryStream();
                stream.CopyTo(ms);
                return JsonSerializer.Deserialize<List<NightOrderItem>>(new ReadOnlySpan<byte>(ms.ToArray()));
            }
        }

        /// <summary>
        /// helper for Save. Save who acts in what order, with what reminders for the other nights.
        /// </summary>
        /// <param name="archive"></param>
        protected void SaveOtherNightsOrder(ZipArchive archive)
        {
            var entry = archive.CreateEntry(OtherNightsFile);
            using (var stream = entry.Open())
            {
                var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true });
                JsonSerializer.Serialize(writer, OtherNightsOrder, new JsonSerializerOptions { WriteIndented = true });
            }
        }

        /// <summary>
        /// Load who acts in what order, with what reminders for the other nights.
        /// </summary>
        /// <param name="archive"></param>
        protected static List<NightOrderItem> LoadOtherNightsOrder(ZipArchive archive)
        {
            var entry = archive.GetEntry(OtherNightsFile);
            using (var stream = entry.Open())
            {
                var ms = new MemoryStream();
                stream.CopyTo(ms);
                return JsonSerializer.Deserialize<List<NightOrderItem>>(new ReadOnlySpan<byte>(ms.ToArray()));
            }
        }

        /// <summary>
        /// query for role info by id
        /// </summary>
        /// <param name="id"></param>
        /// <returns>First SaveRole that matches or null</returns>
        SaveRole GetRoleById(string id)
        {
            foreach (var role in Roles)
            {
                if (role.Id == id)
                {
                    return role;
                }
            }
            return null;
        }
    }
}
