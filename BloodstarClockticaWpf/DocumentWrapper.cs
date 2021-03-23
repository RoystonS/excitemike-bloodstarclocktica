using BloodstarClockticaLib;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;
using static BloodstarClockticaLib.BcImport;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// wrapping document so it can be an INotifyPropertyChanged
    /// </summary>
    class DocumentWrapper : INotifyPropertyChanged
    {
        /// <summary>
        /// wrapped document
        /// </summary>
        private BcDocument document;

        /// <summary>
        /// Name of the set
        /// </summary>
        public string Name
        {
            get => document.Meta.Name;
            set
            {
                if (value != document.Meta.Name)
                {
                    document.Meta.Name = value;
                    Dirty = true;
                    OnPropertyChanged("Name");
                }
            }
        }

        /// <summary>
        /// Author of the set
        /// </summary>
        public string Author
        {
            get => document.Meta.Author;
            set
            {
                if (value != document.Meta.Author)
                {
                    document.Meta.Author = value;
                    Dirty = true;
                    OnPropertyChanged("Author");
                }
            }
        }

        /// <summary>
        /// Whether the document has unsaved changes
        /// </summary>
        public bool Dirty
        {
            get => document.Dirty;
            set
            {
                if (document.Dirty != value)
                {
                    document.Dirty = value;
                    OnPropertyChanged("Dirty");
                    OnPropertyChanged("WindowTitle");
                }
            }
        }

        /// <summary>
        /// What to bind to the title of the window
        /// </summary>
        public string WindowTitle
        {
            get
            {
                if (document.FilePath == "")
                {
                    if (document.Dirty)
                    {
                        return $"• {MainWindow.BaseTitle}";
                    }
                    else
                    {
                        return MainWindow.BaseTitle;
                    }
                }
                else
                {
                    if (document.Dirty)
                    {
                        return $"• {document.FilePath} - {MainWindow.BaseTitle}";
                    }
                    else
                    {
                        return $"{document.FilePath} - {MainWindow.BaseTitle}";
                    }
                }
            }
        }

        /// <summary>
        /// text to display on the button for choosing a logo
        /// </summary>
        public string LogoButtonText => (document.Meta.Logo == null) ? "Click to import logo image" : "";

        /// <summary>
        /// preview of the logo
        /// </summary>
        public BitmapImage LogoPreview
        {
            get
            {
                if (document.Meta.Logo == null) { return null; }
                if (logoPreview != null) { return logoPreview; }
                using (var ms = new MemoryStream())
                {
                    document.Meta.Logo.Save(ms, ImageFormat.Png);
                    ms.Position = 0;
                    var bi = new BitmapImage();
                    bi.BeginInit();
                    bi.CacheOption = BitmapCacheOption.OnLoad;
                    bi.StreamSource = ms;
                    bi.EndInit();
                    logoPreview = bi;
                    return bi;
                }
            }
        }
        private BitmapImage logoPreview;

        /// <summary>
        /// logo image data
        /// </summary>
        public Image Logo
        {
            get
            {
                return document.Meta.Logo;
            }
            set
            {
                document.Meta.Logo = value;
                logoPreview = null;
                Dirty = true;
                OnPropertyChanged("Logo");
                OnPropertyChanged("LogoButtonText");
                OnPropertyChanged("LogoPreview");
            }
        }

        /// <summary>
        /// last save/open location
        /// </summary>
        public string FilePath => document.FilePath;

        /// <summary>
        /// characters in the set
        /// </summary>
        public ObservableCollection<CharacterWrapper> CharacterList { get; set; }

        /// <summary>
        /// Night order of characters in the set
        /// </summary>
        public NightOrderWrapper FirstNightOrder { get; private set; }

        /// <summary>
        /// Night order of characters in the set
        /// </summary>
        public NightOrderWrapper OtherNightOrder { get; private set; }

        /// <summary>
        /// root url from with to look for /roles.json and images/*.png
        /// </summary>
        public string UrlRoot
        {
            get => document.Meta.UrlRoot;
            set
            {
                if (value != document.Meta.UrlRoot)
                {
                    document.Meta.UrlRoot = value;
                    Dirty = true;
                    OnPropertyChanged("UrlRoot");
                }
            }
        }

        /// <summary>
        /// prefix applied to image paths used when exporting to disk. e.g. "https://example.com/botc/SETNAME/images/"
        /// </summary>
        public string ExportToDiskImageUrlPrefix
        {
            get => document.Meta.ExportToDiskImageUrlPrefix;
            set
            {
                if (value != document.Meta.ExportToDiskImageUrlPrefix)
                {
                    document.Meta.ExportToDiskImageUrlPrefix = value;
                    Dirty = true;
                    OnPropertyChanged("ExportToDiskImageUrlPrefix");
                }
            }
        }


        /// <summary>
        /// remote directory to upload to
        /// </summary>
        public string SftpRemoteDirectory
        {
            get => document.Meta.SftpRemoteDirectory;
            set
            {
                if (value != document.Meta.SftpRemoteDirectory)
                {
                    document.Meta.SftpRemoteDirectory = value;
                    Dirty = true;
                    OnPropertyChanged("SftpRemoteDirectory");
                }
            }
        }

        /// <summary>
        /// host to upload to
        /// </summary>
        public string SftpHost
        {
            get => document.Meta.SftpHost;
            set
            {
                if (value != document.Meta.SftpHost)
                {
                    document.Meta.SftpHost = value;
                    Dirty = true;
                    OnPropertyChanged("SftpHost");
                }
            }
        }

        /// <summary>
        /// port number to use with SFTP connection
        /// </summary>
        public int SftpPort
        {
            get => document.Meta.SftpPort;
            set
            {
                if (value != document.Meta.SftpPort)
                {
                    document.Meta.SftpPort = value;
                    Dirty = true;
                    OnPropertyChanged("SftpPort");
                }
            }
        }

        /// <summary>
        /// username to use with SFTP connection
        /// </summary>
        public string SftpUsername
        {
            get => document.Meta.SftpUser;
            set
            {
                if (value != document.Meta.SftpUser)
                {
                    document.Meta.SftpUser = value;
                    Dirty = true;
                    OnPropertyChanged("SftpUser");
                }
            }
        }


        /// <summary>
        /// write the document to a file
        /// </summary>
        /// <param name="path"></param>
        /// <returns>whether it saved successfully</returns>
        public bool Save(string path)
        {
            if (document.Save(path))
            {
                Dirty = false;
                OnPropertyChanged("WindowTitle");
                return true;
            }
            return false;
        }

        /// <summary>
        /// remember where we last exported to
        /// </summary>
        public string ExportToDiskPath
        {
            get => document.Meta.ExportToDiskPath;
            set
            {
                if (value != document.Meta.ExportToDiskPath)
                {
                    document.Meta.ExportToDiskPath = value;
                    Dirty = true;
                }
            }
        }

        /// <summary>
        /// remember whether the user likes to skip unchanged
        /// </summary>
        public bool SkipUnchanged
        {
            get => document.Meta.SkipUnchanged;
            set
            {
                if (value != document.Meta.SkipUnchanged)
                {
                    document.Meta.SkipUnchanged = value;
                    Dirty = true;
                }
            }
        }

        /// <summary>
        /// link to roles.json after upload
        /// </summary>
        public string RolesUrl => BcExport.RolesUrl(document);

        /// <summary>
        /// track whether we are in the middle of updating so we don't have ridiculous event cascades or mark dirty when we shouldn't
        /// </summary>
        private bool updatingCharacterList;

        /// <summary>
        /// text summarizing how much of what will be exported
        /// </summary>
        public string StatusText_Characters
        {
            get
            {
                int exportedCharacterCount = 0;
                int characterCount = 0;
                foreach (var character in CharacterList)
                {
                    characterCount++;
                    if (character.IncludeInExport.Value)
                    {
                        exportedCharacterCount++;
                    }
                }
                return $"{exportedCharacterCount}/{characterCount} Characters";
            }
        }
        /// <summary>
        /// text summarizing how much of what will be exported
        /// </summary>
        public string StatusText_Townsfolk
        {
            get
            {
                int exportedTownsfolkCount = 0;
                int townsfolkCount = 0;
                foreach (var character in CharacterList)
                {
                    if (BcTeam.TeamValue.Townsfolk == BcTeam.FromString(character.TeamProperty.DisplayString))
                    {
                        townsfolkCount++;
                        if (character.IncludeInExport.Value)
                        {
                            exportedTownsfolkCount++;
                        }
                    }
                }
                return $"{exportedTownsfolkCount}/{townsfolkCount} Townsfolk";
            }
        }
        /// <summary>
        /// text summarizing how much of what will be exported
        /// </summary>
        public string StatusText_Outsiders
        {
            get
            {
                int exportedOutsiderCount = 0;
                int outsiderCount = 0;
                foreach (var character in CharacterList)
                {
                    if (BcTeam.TeamValue.Outsider == BcTeam.FromString(character.TeamProperty.DisplayString))
                    {
                        outsiderCount++;
                        if (character.IncludeInExport.Value)
                        {
                            exportedOutsiderCount++;
                        }
                    }
                }
                return $"{exportedOutsiderCount}/{outsiderCount} Outsiders";
            }
        }
        /// <summary>
        /// text summarizing how much of what will be exported
        /// </summary>
        public string StatusText_Minions
        {
            get
            {
                int exportedMinionCount = 0;
                int minionCount = 0;
                foreach (var character in CharacterList)
                {
                    if (BcTeam.TeamValue.Minion == BcTeam.FromString(character.TeamProperty.DisplayString))
                    {
                        minionCount++;
                        if (character.IncludeInExport.Value)
                        {
                            exportedMinionCount++;
                        }
                    }
                }
                return $"{exportedMinionCount}/{minionCount} Minions";
            }
        }
        /// <summary>
        /// text summarizing how much of what will be exported
        /// </summary>
        public string StatusText_Demons
        {
            get
            {
                int exportedDemonCount = 0;
                int demonCount = 0;
                foreach (var character in CharacterList)
                {
                    if (BcTeam.TeamValue.Demon == BcTeam.FromString(character.TeamProperty.DisplayString))
                    {
                        demonCount++;
                        if (character.IncludeInExport.Value)
                        {
                            exportedDemonCount++;
                        }
                    }
                }
                return $"{exportedDemonCount}/{demonCount} Demons";
            }
        }
        /// <summary>
        /// text summarizing how much of what will be exported
        /// </summary>
        public string StatusText_Travelers
        {
            get
            {
                int exportedTravelerCount = 0;
                int travelerCount = 0;
                foreach (var character in CharacterList)
                {
                    if (BcTeam.TeamValue.Traveler == BcTeam.FromString(character.TeamProperty.DisplayString))
                    {
                        travelerCount++;
                        if (character.IncludeInExport.Value)
                        {
                            exportedTravelerCount++;
                        }
                    }
                }
                return $"{exportedTravelerCount}/{travelerCount} Travelers";
            }
        }

        /// <summary>
        /// listen for when  property changes
        /// </summary>
        public event PropertyChangedEventHandler PropertyChanged;

        /// <summary>
        /// send event about what property changed
        /// </summary>
        /// <param name="propertyName"></param>
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

        /// <summary>
        /// change the wrapped document
        /// </summary>
        /// <param name="document"></param>
        public void SetDocument(BcDocument document)
        {
            this.document = document;
            UpdateCharacterList();
            logoPreview = null;
            OnPropertyChanged(null);
        }

        /// <summary>
        /// wrap a new document
        /// </summary>
        public DocumentWrapper() : this(new BcDocument())
        {
        }

        /// <summary>
        /// new wrapper for the document
        /// </summary>
        /// <param name="document"></param>
        public DocumentWrapper(BcDocument document)
        {
            updatingCharacterList = false;
            this.document = document;
            CharacterList = new ObservableCollection<CharacterWrapper>();
            UpdateCharacterList();
            CharacterList.CollectionChanged += CharacterList_CollectionChanged;
            FirstNightOrder = new NightOrderWrapper(this, true);
            OtherNightOrder = new NightOrderWrapper(this, false);
        }

        /// <summary>
        /// mark dirty when the character list changes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CharacterList_CollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (!updatingCharacterList)
            {
                UpdateCharacterList();
                Dirty = true;
            }
        }

        /// <summary>
        /// rebuild the list of character wrappers
        /// </summary>
        public void UpdateCharacterList()
        {
            updatingCharacterList = true;
            try
            {
                var numCharacters = document.Characters.Count;
                for (var i = 0; i < numCharacters; ++i)
                {
                    if (i < CharacterList.Count)
                    {
                        CharacterList[i].Character = document.Characters[i];
                    }
                    else
                    {
                        var wrapper = new CharacterWrapper(document.Characters[i]);
                        wrapper.PropertyChanged += Character_PropertyChanged;
                        CharacterList.Add(wrapper);
                    }
                }
                while (CharacterList.Count > numCharacters)
                {
                    CharacterList[CharacterList.Count - 1].PropertyChanged -= Character_PropertyChanged;
                    CharacterList.RemoveAt(CharacterList.Count - 1);
                }
                OnPropertyChanged("CharacterList");
                StatusTextChanged();
            }
            finally
            {
                updatingCharacterList = false;
            }
        }

        /// <summary>
        /// add a new character to the set
        /// </summary>
        public void AddCharacter()
        {
            AddCharacter(new BcCharacter(document));
        }

        /// <summary>
        /// add a new character to the set
        /// </summary>
        public void AddCharacter(BcCharacter character)
        {
            AddCharacter(new CharacterWrapper(character));
        }

        /// <summary>
        /// add a new character to the set
        /// </summary>
        public void AddCharacter(CharacterWrapper character)
        {
            document.Characters.Add(character.Character);
            character.PropertyChanged += Character_PropertyChanged;
            CharacterList.Add(character);
            StatusTextChanged();
            Dirty = true;
        }

        /// <summary>
        /// add new characters to the set
        /// </summary>
        public void AddCharacters(IEnumerable<CharacterWrapper> characters)
        {
            foreach (var c in characters)
            {
                AddCharacter(c);
            }
        }

        /// <summary>
        /// mark dirty when a character property changes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Character_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!updatingCharacterList)
            {
                switch (e.PropertyName)
                {
                    case "TeamProperty":
                    case "IncludeInExport":
                        StatusTextChanged();
                        break;
                    default:
                        break;
                }
                Dirty = true;
            }
        }

        /// <summary>
        /// delete a character from the set
        /// </summary>
        /// <param name="index"></param>
        public void RemoveCharacter(int index)
        {
            if (index != -1)
            {
                document.Characters.RemoveAt(index);
                CharacterList.RemoveAt(index);
                StatusTextChanged();
                Dirty = true;
            }
        }

        /// <summary>
        /// change character order
        /// </summary>
        /// <param name="indexA"></param>
        /// <param name="indexB"></param>
        public void SwapCharacterOrder(int indexA, int indexB)
        {
            {
                var temp = document.Characters[indexA];
                document.Characters[indexA] = document.Characters[indexB];
                document.Characters[indexB] = temp;
            }
            CharacterList.Move(indexA, indexB);
            Dirty = true;
        }

        /// <summary>
        /// save output files to disk
        /// </summary>
        public void ExportToDisk(string directory, string imageUrlPrefix)
        {
            ExportToDiskPath = directory;
            ExportToDiskImageUrlPrefix = imageUrlPrefix;
            BcExport.ExportToDisk(document, directory, imageUrlPrefix);
        }

        /// <summary>
        /// upload via sftp
        /// </summary>
        public async Task ExportToSftp(string password, IProgress<double> progress)
        {
            bool changedAny = await BcExport.ExportViaSftp(document, password, progress);
            if (changedAny)
            {
                Dirty = true;
            }
        }

        /// <summary>
        /// create a copy of an official character
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        internal IEnumerable<CharacterWrapper> CloneOfficialCharacters(IEnumerable<string> ids)
        {
            return CloneOfficialCharacters(ids, null);
        }

        /// <summary>
        /// create a copy of an official character
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        internal IEnumerable<CharacterWrapper> CloneOfficialCharacters(IEnumerable<string> ids, IProgress<double> progress)
        {
            var list = new List<string>(ids);
            var outputList = new List<CharacterWrapper>(list.Count);
            double denom = list.Count;
            int i = 0;
            progress?.Report(0);
            foreach (var id in list)
            {
                outputList.Add(new CharacterWrapper(BcOfficial.CloneOfficialCharacter(document, id)));
                progress?.Report((++i) / denom);
            }
            return outputList;
        }

        /// <summary>
        /// import a character from a loaded roles.json
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        internal IEnumerable<CharacterWrapper> ImportCharacters(IEnumerable<RolesJsonCharacter> characters)
        {
            return ImportCharacters(characters, null);
        }

        /// <summary>
        /// import a character from a loaded roles.json
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        internal IEnumerable<CharacterWrapper> ImportCharacters(IEnumerable<RolesJsonCharacter> characters, IProgress<double> progress)
        {
            var list = new List<RolesJsonCharacter>(characters);
            var outputList = new List<CharacterWrapper>(list.Count);
            double denom = list.Count;
            int i = 0;
            progress?.Report(0);
            foreach (var character in list)
            {
                outputList.Add(new CharacterWrapper(ImportCharacter(document, character, false)));
                progress?.Report((++i) / denom);
            }
            return outputList;
        }

        /// <summary>
        /// import already-made BcCharacters
        /// </summary>
        /// <param name="characters"></param>
        /// <returns></returns>
        internal IEnumerable<CharacterWrapper> ImportCharacters(IEnumerable<BcCharacter> characters)
        {
            return new List<CharacterWrapper>(from character in characters select new CharacterWrapper(character.Clone(document)));
        }

        /// <summary>
        /// send PropertyChanged events for the whole status bar
        /// </summary>
        private void StatusTextChanged()
        {
            OnPropertyChanged("StatusText_Characters");
            OnPropertyChanged("StatusText_Townsfolk");
            OnPropertyChanged("StatusText_Outsiders");
            OnPropertyChanged("StatusText_Minions");
            OnPropertyChanged("StatusText_Demons");
            OnPropertyChanged("StatusText_Travelers");
        }
    }
}
