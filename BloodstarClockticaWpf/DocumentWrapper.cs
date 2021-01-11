using BloodstarClockticaLib;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Media.Imaging;

namespace BloodstarClockticaWpf
{
    class DocumentWrapper : INotifyPropertyChanged
    {
        private BcDocument document;
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

        public bool Dirty
        {
            get => document.Dirty;
            set
            {
                document.Dirty = value;
                OnPropertyChanged("Dirty");
                OnPropertyChanged("WindowTitle");
            }
        }

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

        public string LogoButtonText => (document.Meta.Logo == null) ? "Click to import logo image" : "";
        public BitmapImage LogoPreview
        {
            get
            {
                // TODO: I should really cache these
                if (document.Meta.Logo == null) { return null; }
                using (var ms = new MemoryStream())
                {
                    document.Meta.Logo.Save(ms, ImageFormat.Png);
                    ms.Position = 0;
                    var bi = new BitmapImage();
                    bi.BeginInit();
                    bi.CacheOption = BitmapCacheOption.OnLoad;
                    bi.StreamSource = ms;
                    bi.EndInit();
                    return bi;
                }
            }
        }

        public Image Logo
        {
            get
            {
                return document.Meta.Logo;
            }
            set
            {
                document.Meta.Logo = value;
                Dirty = true;
                OnPropertyChanged("Logo");
                OnPropertyChanged("LogoButtonText");
                OnPropertyChanged("LogoPreview");
            }
        }

        public string FilePath => document.FilePath;

        public ObservableCollection<CharacterWrapper> CharacterList { get; set; }

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
                    OnPropertyChanged(UrlRoot);
                }
            }
        }

        public bool Save(string path)
        {
            if (document.Save(path))
            {
                Dirty = false;
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

        private bool updatingCharacterList;

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        public void SetDocument(BcDocument document)
        {
            this.document = document;
            UpdateCharacterList();
            OnPropertyChanged(null);
        }
        public DocumentWrapper() : this(new BcDocument())
        {
        }
        public DocumentWrapper(BcDocument document)
        {
            this.updatingCharacterList = false;
            this.document = document;
            CharacterList = new ObservableCollection<CharacterWrapper>();
            UpdateCharacterList();
            CharacterList.CollectionChanged += CharacterList_CollectionChanged;
        }
        private void CharacterList_CollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (!updatingCharacterList)
            {
                Dirty = true;
            }
        }

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
            }
            finally
            {
                updatingCharacterList = false;
            }
        }

        public void AddCharacter()
        {
            var character = new BcCharacter(document);
            document.Characters.Add(character);
            var wrapper = new CharacterWrapper(character);
            wrapper.PropertyChanged += Character_PropertyChanged;
            CharacterList.Add(wrapper);
            Dirty = true;
        }

        private void Character_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!updatingCharacterList)
            {
                Dirty = true;
            }
        }

        public void RemoveCharacter(int index)
        {
            if (index != -1)
            {
                document.Characters.RemoveAt(index);
                CharacterList.RemoveAt(index);
                Dirty = true;
            }
        }

        public void SwapCharacterOrder(int indexA, int indexB)
        {
            {
                var temp = document.Characters[indexA];
                document.Characters[indexA] = document.Characters[indexB];
                document.Characters[indexB] = temp;
            }
            {
                var temp = CharacterList[indexA];
                CharacterList[indexA] = CharacterList[indexB];
                CharacterList[indexB] = temp;
            }
            Dirty = true;
        }

        /// <summary>
        /// save output iles to disk
        /// </summary>
        public void ExportToDisk(string directory, string urlPrefix)
        {
            ExportToDiskPath = directory;
            BcExport.ExportToDisk(document, directory, urlPrefix);
        }
        public void ExportToSftp()
        {
            throw new NotImplementedException();
            //document.ExportToSftp();
        }
    }
}
