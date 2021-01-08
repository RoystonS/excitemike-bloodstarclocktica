using BloodstarClockticaLib;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Media.Imaging;

namespace BloodstarClockticaWpf
{
    class CharacterWrapper : INotifyPropertyChanged
    {
        private BcCharacter character;
        public BcCharacter Character
        {
            get => character;
            set
            {
                character = value;
                OnPropertyChanged(null);
            }
        }
        public string Name
        {
            get => character.Name;
            set
            {
                if (value != character.Name)
                {
                    character.Name = value;
                    OnPropertyChanged("Name");
                }
            }
        }
        public string Team
        {
            get => BcTeam.ToString(character.Team);
            set
            {
                if (value != character.Name)
                {
                    character.Name = value;
                    OnPropertyChanged("Team");
                }
            }
        }
        public BitmapImage ImagePreview
        {
            get
            {
                // TODO: I should really cache these
                if (character.ProcessedImage == null) { return null; }
                using (var ms = new MemoryStream())
                {
                    character.ProcessedImage.Save(ms, ImageFormat.Png);
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
        public BitmapImage SourceImagePreview
        {
            get
            {
                // TODO: I should really cache these
                if (character.SourceImage == null) { return null; }
                using (var ms = new MemoryStream())
                {
                    character.SourceImage.Save(ms, ImageFormat.Png);
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
        public Image SourceImage
        {
            get
            {
                return character.SourceImage;
            }
            set
            {
                character.ProcessedImage = null;
                OnPropertyChanged("CharacterImagePreview");
                OnPropertyChanged("CharacterSourceImagePreview");
                OnPropertyChanged("SourceImage");
            }
        }
        public string LogoButtonText => (character.SourceImage == null) ? "Click to import source image" : "";

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

        public CharacterWrapper()
        {
        }
        public CharacterWrapper(BcCharacter character)
        {
            this.character = character;
        }
    }
}
