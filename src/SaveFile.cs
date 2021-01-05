using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;

namespace BloodstarClocktica
{
    internal class SaveFile
    {
        internal static string RoleDir = "roles";
        internal static string SourceImageDir = "src_images";
        internal static string ProcessedImageDir = "processed_images";
        internal static string PathSep = "/";
        internal static string MetaFile = "meta.json";
        internal static string FirstNightFile = "FirstNight.json";
        internal static string OtherNightsFile = "OtherNights.json";
        internal static string LogoFile = "logo.png";

        /// <summary>
        /// Last save/load location
        /// </summary>
        internal string FilePath { get; set; }

        /// <summary>
        /// whether a save is needed
        /// </summary>
        internal bool Dirty { get; set; }

        /// <summary>
        /// information about the set itself
        /// </summary>
        internal SaveMeta Meta { get; set; }

        /// <summary>
        /// information on roles in the game
        /// </summary>
        internal List<SaveRole> Roles { get; set; }

        /// <summary>
        ///  create brand new SaveFile
        /// </summary>
        internal SaveFile()
        {
            FilePath = string.Empty;
            Dirty = false;
            Meta = SaveMeta.Default();
            Roles = new List<SaveRole>();
        }

        /// <summary>
        /// create from loaded file
        /// </summary>
        protected SaveFile(
            string filePath,
            SaveMeta meta,
            List<SaveRole> roles
            )
        {
            FilePath = filePath;
            Dirty = false;
            Meta = meta;
            Roles = roles;
        }

        /// <summary>
        /// load SaveFile from disk
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        internal static SaveFile Load(String filePath)
        {
            using (var archive = ZipFile.Open(filePath, ZipArchiveMode.Read))
            {
                return new SaveFile(
                    filePath,
                    LoadMetadata(archive),
                    LoadRoles(archive)
               );
            }
        }

        /// <summary>
        /// save to zip file
        /// </summary>
        /// <param name="path"></param>
        internal void Save(string path)
        {
            FilePath = path;
            using (Stream stream = new FileStream(path, FileMode.Create, FileAccess.Write))
            {
                using (ZipArchive archive = new ZipArchive(stream, ZipArchiveMode.Create))
                {
                    SaveMetadata(archive);
                    SaveRoles(archive);
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
                    var id = Path.GetFileNameWithoutExtension(entry.Name);
                    var srcImageEntry = archive.GetEntry($"{SourceImageDir}{PathSep}{id}.png");
                    var processedImageEntry = archive.GetEntry($"{ProcessedImageDir}{PathSep}{id}.png");
                    list.Add(SaveRole.Load(entry, srcImageEntry, processedImageEntry));
                }
            }
            return list;
        }
    }
}
