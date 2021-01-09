using BloodstarClockticaLib;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Windows.Media.Imaging;

namespace BloodstarClockticaWpf
{
    class StringBindingHelper
    {
        private readonly Func<string> getter;
        private readonly Action<string> setter;
        public string Name { get; private set; }
        public string Description { get; private set; }
        public string Value
        {
            get => getter();
            set => setter(value);
        }
        public StringBindingHelper(string name, string description, Func<string> getter, Action<string> setter)
        {
            Name = name;
            Description = description;
            this.getter = getter;
            this.setter = setter;
        }
    }
    class ComboBoxBindingHelper
    {
        private readonly Func<string> getter;
        private readonly Action<string> setter;
        public string Name { get; private set; }
        public string Description { get; private set; }
        public List<string> Options { get; private set; }
        public int SelectedIndex
        {
            get => Options.FindIndex(x => x == getter());
            set => setter(Options[value]);
        }
        public ComboBoxBindingHelper(string name, string description, IEnumerable<string> options, Func<string> getter, Action<string> setter)
        {
            Name = name;
            Description = description;
            Options = new List<string>(options);
            this.getter = getter;
            this.setter = setter;
        }
    }

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
        public string Id
        {
            get => character.Id;
            set
            {
                if (value != character.Id)
                {
                    character.Id = value;
                    OnPropertyChanged("Id");
                }
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
            get => BcTeam.ToDisplayString(character.Team);
            set
            {
                var enumValue = BcTeam.FromString(value);
                if (enumValue != character.Team)
                {
                    character.Team = enumValue;
                    OnPropertyChanged("Team");
                }
            }
        }
        public string Ability
        {
            get => character.Ability;
            set
            {
                if (value != character.Ability)
                {
                    character.Ability = value;
                    OnPropertyChanged("Ability");
                }
            }
        }
        public string FirstNightReminder
        {
            get => character.FirstNightReminder;
            set
            {
                if (value != character.FirstNightReminder)
                {
                    character.FirstNightReminder = value;
                    OnPropertyChanged("FirstNightReminder");
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
                character.SourceImage = value;
                OnPropertyChanged("CharacterImagePreview");
                OnPropertyChanged("CharacterSourceImagePreview");
                OnPropertyChanged("SourceImage");
            }
        }
        public string SourceImageButtonText => (character.SourceImage == null) ? "Click to import source image" : "";


        public StringBindingHelper IdProperty { get; private set; }
        public StringBindingHelper NameProperty { get; private set; }
        public ComboBoxBindingHelper TeamProperty { get; private set; }
        public StringBindingHelper AbilityProperty { get; private set; }
        public StringBindingHelper FirstNightReminderProperty { get; private set; }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

        public CharacterWrapper()
        {
            SetDefaults();
        }
        public CharacterWrapper(BcCharacter character)
        {
            SetDefaults();
            this.character = character;
        }
        private void SetDefaults()
        {
            IdProperty = new StringBindingHelper("Id", "The internal ID for this character, without spaces or special characters", () => Id, (id) => { Id = id; });
            NameProperty = new StringBindingHelper("Name", "The internal ID for this character, without spaces or special characters", () => Name, (name) => { Name = name; });
            TeamProperty = new ComboBoxBindingHelper(
                "Team",
                "The team of the character",
                from BcTeam.TeamValue team in Enum.GetValues(typeof(BcTeam.TeamValue)) select BcTeam.ToDisplayString(team),
                () => Team,
                (team) => { Team = team; }
            );
            AbilityProperty = new StringBindingHelper("Ability", "The displayed ability text of the character", () => Ability, (ability) => { Ability = ability; } );
            FirstNightReminderProperty = new StringBindingHelper(
                "First Night",
                "Reminder text for first night",
                () => FirstNightReminder,
                (x) => { FirstNightReminder = x; }
            );
        }
    }
}
