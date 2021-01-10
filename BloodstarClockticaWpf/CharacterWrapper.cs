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
        public bool Multiline { get; private set; }
        public StringBindingHelper(string name, string description, Func<string> getter, Action<string> setter, bool multiline)
        {
            Name = name;
            Description = description;
            this.getter = getter;
            this.setter = setter;
            this.Multiline = multiline;
        }
    }
    class ComboBoxBindingHelper
    {
        private readonly Func<string> getter;
        private readonly Action<string> setter;

        public string Name { get; private set; }
        public string Description { get; private set; }
        public List<string> Options { get; private set; }
        public string DisplayString => getter();
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
        // TODO: what am I doing? this can just be a checkbox
        private string SetupString
        {
            get => character.Setup ? "True" : "False";
            set
            {
                bool bValue = value == "True";
                if (bValue != character.Setup)
                {
                    character.Setup = bValue;
                    OnPropertyChanged("SetupString");
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
            get => character.SourceImage;
            set
            {
                character.ProcessedImage = null;
                character.SourceImage = value;
                OnPropertyChanged("ImagePreview");
                OnPropertyChanged("SourceImagePreview");
                OnPropertyChanged("SourceImage");
                OnPropertyChanged("SourceImageButtonText");
            }
        }
        public string SourceImageButtonText => (character.SourceImage == null) ? "Click to import source image" : "";

        public int FirstNightOrder
        {
            get => character.FirstNightOrder;
            set
            {
                if (value != character.FirstNightOrder)
                {
                    character.FirstNightOrder = value;
                    OnPropertyChanged("FirstNightOrder");
                }
            }
        }
        public int OtherNightOrder
        {
            get => character.OtherNightOrder;
            set
            {
                if (value != character.OtherNightOrder)
                {
                    character.OtherNightOrder = value;
                    OnPropertyChanged("OtherNightOrder");
                }
            }
        }

        public StringBindingHelper IdProperty { get; private set; }
        public StringBindingHelper NameProperty { get; private set; }
        public ComboBoxBindingHelper TeamProperty { get; private set; }
        public StringBindingHelper AbilityProperty { get; private set; }
        public StringBindingHelper FirstNightReminderProperty { get; private set; }
        public StringBindingHelper OtherNightReminderProperty { get; private set; }
        public ComboBoxBindingHelper SetupProperty { get; private set; }
        public StringBindingHelper ReminderTokensProperty { get; private set; }
        public StringBindingHelper GlobalReminderTokensProperty { get; private set; }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

        public CharacterWrapper()
        {
            SetupProperties();
        }
        public CharacterWrapper(BcCharacter character)
        {
            SetupProperties();
            this.character = character;
        }
        private void SetupProperties()
        {
            IdProperty = new StringBindingHelper(
                "Id",
                "The internal ID for this character, without spaces or special characters",
                () => character.Id,
                (value) =>
                {
                    if (value != character.Id)
                    {
                        character.Id = value;
                        OnPropertyChanged("Id");
                        OnPropertyChanged("IdProperty");
                    }
                },
                false);
            NameProperty = new StringBindingHelper(
                "Name",
                "The internal ID for this character, without spaces or special characters",
                () => character.Name,
                (value) =>
                {
                    if (value != character.Name)
                    {
                        character.Name = value;
                        OnPropertyChanged("Name");
                        OnPropertyChanged("NameProperty");
                    }
                },
                false);
            TeamProperty = new ComboBoxBindingHelper(
                "Team",
                "The team of the character",
                from BcTeam.TeamValue team in Enum.GetValues(typeof(BcTeam.TeamValue)) select BcTeam.ToDisplayString(team),
                () => BcTeam.ToDisplayString(character.Team),
                (value) =>
                {
                    var enumValue = BcTeam.FromString(value);
                    if (enumValue != character.Team)
                    {
                        character.Team = enumValue;
                        character.ProcessedImage = null;
                        OnPropertyChanged("Team");
                        OnPropertyChanged("TeamProperty");
                        OnPropertyChanged("ImagePreview");
                    }
                }
            );
            AbilityProperty = new StringBindingHelper(
                "Ability",
                "The displayed ability text of the character",
                () => character.Ability,
                (value) =>
                {
                    if (value != character.Ability)
                    {
                        character.Ability = value;
                        OnPropertyChanged("Ability");
                        OnPropertyChanged("AbilityProperty");
                    }
                },
                false);
            FirstNightReminderProperty = new StringBindingHelper(
                "First Night",
                "Reminder text for first night",
                () => character.FirstNightReminder,
                (value) =>
                {
                    if (value != character.FirstNightReminder)
                    {
                        character.FirstNightReminder = value;
                        OnPropertyChanged("FirstNightReminder");
                        OnPropertyChanged("FirstNightReminderProperty");
                    }
                },
                false
            );
            OtherNightReminderProperty = new StringBindingHelper(
                "Other Night",
                "Reminder text for other nights",
                () => character.OtherNightReminder,
                (value) =>
                {
                    if (value != character.OtherNightReminder)
                    {
                        character.OtherNightReminder = value;
                        OnPropertyChanged("OtherNightsReminder");
                        OnPropertyChanged("OtherNightsReminderProperty");
                    }
                },
                false
            );
            SetupProperty = new ComboBoxBindingHelper(
                 "Setup",
                 "Whether this token affects setup (orange leaf), like the Drunk or Baron",
                 new string[] { "False", "True" },
                 () => SetupString,
                 (x) => { SetupString = x; }
             );
            ReminderTokensProperty = new StringBindingHelper(
                "Character",
                "Reminder tokens for this character (one per line)",
                () => string.Join(Environment.NewLine, character.ReminderTokens),
                (value) =>
                {
                    var tokens = from token in value.Split(new string[] { Environment.NewLine }, StringSplitOptions.None) select token;
                    character.ReminderTokens = new List<string>(tokens);
                    OnPropertyChanged("ReminderTokens");
                    OnPropertyChanged("ReminderTokensProperty");
                },
                true
            );
            GlobalReminderTokensProperty = new StringBindingHelper(
                "Global",
                "Reminder tokens that are always available (one per line)",
                () => string.Join(Environment.NewLine, character.GlobalReminderTokens),
                (value) =>
                {
                    var tokens = from token in value.Split(new string[] { Environment.NewLine }, StringSplitOptions.None) select token;
                    character.GlobalReminderTokens = new List<string>(tokens);
                    OnPropertyChanged("GlobalReminderTokens");
                    OnPropertyChanged("GlobalReminderTokensProperty");
                },
                true
            );
        }
    }
}
