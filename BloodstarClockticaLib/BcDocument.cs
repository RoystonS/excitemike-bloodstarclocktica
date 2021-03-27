using System.Collections.Generic;
using System.IO;
using System.IO.Compression;

namespace BloodstarClockticaLib
{
    public class BcDocument
    {
        internal static string FirstNightFile = "FirstNight.json";
        internal static string OtherNightsFile = "OtherNights.json";
        internal static string PathSep = "/";

        /// <summary>
        /// Last save/load location
        /// </summary>
        public string FilePath => filePath;
        private string filePath = "";

        /// <summary>
        /// information about the custom edition itself
        /// </summary>
        public BcMeta Meta => meta;
        private BcMeta meta;

        /// <summary>
        /// data for each character in the set
        /// </summary>
        public List<BcCharacter> Characters => characters;
        private List<BcCharacter> characters = new List<BcCharacter>();

        /// <summary>
        /// whether a save is needed
        /// </summary>
        public bool Dirty
        {
            get => dirty;
            set { dirty = value; }
        }
        private bool dirty;

        /// <summary>
        /// default BcDocument
        /// </summary>
        public BcDocument()
        {
            SetDefaults();
        }

        private void SetDefaults()
        {
            filePath = string.Empty;
            dirty = false;
            meta = new BcMeta();
            characters = new List<BcCharacter>
            {
                new BcCharacter(this)
            };
        }

        /// <summary>
        /// read BcDocument from file
        /// </summary>
        /// <param name="filePath"></param>
        public BcDocument(string filePath)
        {
            SetDefaults();
            using (var archive = ZipFile.Open(filePath, ZipArchiveMode.Read))
            {
                this.filePath = filePath;
                meta = new BcMeta(archive);
                characters = LoadCharacters(archive);
            }
        }

        /// <summary>
        /// save to zip file
        /// </summary>
        /// <param name="path"></param>
        /// <returns>whether it successfully saved</returns>
        public bool Save(string path)
        {
            filePath = path;

            // write zip to temp location first so that if something horrible happens, the previous save isn't corrupted
            bool success = false;
            var tempPath = Path.GetTempFileName();
            try
            {
                using (Stream stream = new FileStream(tempPath, FileMode.Create, FileAccess.Write))
                {
                    using (ZipArchive archive = new ZipArchive(stream, ZipArchiveMode.Create))
                    {
                        SaveMeta(archive);
                        SaveCharacters(archive);
                        success = true;
                    }
                }
            }
            catch
            {
                throw;
            }

            // write temp file to final location
            if (success)
            {
                dirty = false;
                File.Copy(tempPath, path, true);
            }

            return true;
        }

        /// <summary>
        /// helper for Save. Save the "meta" json file in the .zip
        /// </summary>
        /// <param name="archive"></param>
        protected void SaveMeta(ZipArchive archive)
        {
            meta.Save(archive);
        }

        /// <summary>
        /// helper for Save. Save each character's json file and associated images in the .zip
        /// </summary>
        /// <param name="archive"></param>
        protected void SaveCharacters(ZipArchive archive)
        {
            foreach (var character in characters)
            {
                character.Save(archive);
            }
        }

        /// <summary>
        /// load character information from the archive
        /// </summary>
        /// <param name="archive"></param>
        /// <returns></returns>
        protected List<BcCharacter> LoadCharacters(ZipArchive archive)
        {
            var list = new List<BcCharacter>();
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                if (entry.FullName.StartsWith($"{BcCharacter.RoleDir}{PathSep}"))
                {
                    var id = Path.GetFileNameWithoutExtension(entry.Name);
                    list.Add(new BcCharacter(this, archive, id));
                }
            }
            return list;
        }

        /// <summary>
        /// check whether the id is taken
        /// </summary>
        /// <param name="id"></param>
        /// <returns>true if the id is a unique one</returns>
        internal bool IsIdAvailable(string id) => IsIdAvailable(id, -1);

        /// <summary>
        /// check whether the id is taken
        /// </summary>
        /// <param name="id"></param>
        /// <param name="characterIndex">character to skip when checking (usually the one you are changing)</param>
        /// <returns>true if the id is a unique one</returns>
        internal bool IsIdAvailable(string id, int characterIndex)
        {
            for (var i = 0; i < characters.Count; ++i)
            {
                var character = characters[i];
                if ((i != characterIndex) && (id == character.Id))
                {
                    return false;
                }
            }
            return true;
        }

        /// <summary>
        /// mark all images as in need of reexport
        /// </summary>
        internal bool MarkAllImagesInNeedOfReupload()
        {
            bool changedAny = false;
            Meta.LogoUploaded = false;
            Meta.AlmanacImagesUploaded = false;
            foreach (var character in Characters)
            {
                if (character.ImageUploaded)
                {
                    changedAny = true;
                }
                character.ImageUploaded = false;
            }
            return changedAny;
        }

        /// <summary>
        /// mark all images as in need of reexport
        /// </summary>
        internal bool MarkAllImagesUploaded()
        {
            bool changedAny = false;
            Meta.LogoUploaded = true;
            Meta.AlmanacImagesUploaded = true;
            foreach (var character in Characters)
            {
                if (character.IncludeInExport)
                {
                    if (!character.ImageUploaded)
                    {
                        changedAny = true;
                    }
                    character.ImageUploaded = true;
                }
            }
            return changedAny;
        }
    }
}
