﻿using BloodstarClockticaLib;
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
    class BoolBindingHelper
    {
        private readonly Func<bool> getter;
        private readonly Action<bool> setter;
        public string Name { get; private set; }
        public string Description { get; private set; }
        public bool Value
        {
            get => getter();
            set => setter(value);
        }
        public BoolBindingHelper(string name, string description, Func<bool> getter, Action<bool> setter)
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
                if (character != value)
                {
                    character = value;
                    cachedImagePreview = null;
                    cachedImageOnTokenPreview = null;
                    cachedSourceImagePreview = null;
                    OnPropertyChanged(null);
                }
            }
        }

        private bool Setup
        {
            get => character.Setup;
            set
            {
                if (value != character.Setup)
                {
                    character.Setup = value;
                    OnPropertyChanged("Setup");
                }
            }
        }

        private BitmapImage cachedImagePreview;
        public BitmapImage ImagePreview
        {
            get
            {
                if (character.ProcessedImage == null) { return null; }
                if (cachedImagePreview != null) { return cachedImagePreview; }
                using (var ms = new MemoryStream())
                {
                    new Bitmap(character.ProcessedImage)
                        .Trim()
                        .Save(ms, ImageFormat.Png);
                    ms.Position = 0;
                    var bi = new BitmapImage();
                    bi.BeginInit();
                    bi.CacheOption = BitmapCacheOption.OnLoad;
                    bi.StreamSource = ms;
                    bi.EndInit();
                    cachedImagePreview = bi;
                    return bi;
                }
            }
        }
        public int ImagePreviewMaxWidth => (ImagePreview == null) ? 0 : ImagePreview.PixelWidth;
        public int ImagePreviewMaxHeight => (ImagePreview == null) ? 0 : ImagePreview.PixelHeight;

        private BitmapImage cachedImageOnTokenPreview;
        public BitmapImage ImageOnTokenPreview
        {
            get
            {
                if (character.ProcessedImage == null) { return null; }
                if (cachedImageOnTokenPreview != null) { return cachedImageOnTokenPreview; }
                using (var ms = new MemoryStream())
                {
                    var destination = new Rectangle(0, 0, BcOfficial.TokenImage.Width, BcOfficial.TokenImage.Height);
                    BcOfficial.TokenImage
                        .PasteZoomed(character.ProcessedImage, destination)
                        .Save(ms, ImageFormat.Png);

                    ms.Position = 0;
                    var bi = new BitmapImage();
                    bi.BeginInit();
                    bi.CacheOption = BitmapCacheOption.OnLoad;
                    bi.StreamSource = ms;
                    bi.EndInit();
                    cachedImageOnTokenPreview = bi;
                    return bi;
                }
            }
        }
        public int ImageOnTokenPreviewMaxWidth => (ImageOnTokenPreview == null) ? 0 : ImageOnTokenPreview.PixelWidth;
        public int ImageOnTokenPreviewMaxHeight => (ImageOnTokenPreview == null) ? 0 : ImageOnTokenPreview.PixelHeight;

        private BitmapImage cachedSourceImagePreview;
        public BitmapImage SourceImagePreview
        {
            get
            {
                if (character.SourceImage == null) { return null; }
                if (cachedSourceImagePreview != null) { return cachedSourceImagePreview; }
                using (var ms = new MemoryStream())
                {
                    character.SourceImage.Save(ms, ImageFormat.Png);
                    ms.Position = 0;
                    var bi = new BitmapImage();
                    bi.BeginInit();
                    bi.CacheOption = BitmapCacheOption.OnLoad;
                    bi.StreamSource = ms;
                    bi.EndInit();
                    cachedSourceImagePreview = bi;
                    return bi;
                }
            }
        }
        public int SourceImagePreviewMaxWidth => (SourceImagePreview == null) ? 0 : SourceImagePreview.PixelWidth;
        public int SourceImagePreviewMaxHeight => (SourceImagePreview == null) ? 0 : SourceImagePreview.PixelHeight;
        public Image SourceImage
        {
            get => character.SourceImage;
            set
            {
                if (value != character.SourceImage)
                {
                    cachedImagePreview = null;
                    cachedImageOnTokenPreview = null;
                    cachedSourceImagePreview = null;
                    character.ProcessedImage = null;
                    character.SourceImage = value;
                    OnPropertyChanged("ImagePreview");
                    OnPropertyChanged("ImagePreviewMaxHeight");
                    OnPropertyChanged("ImagePreviewMaxWidth");
                    OnPropertyChanged("ImageOnTokenPreview");
                    OnPropertyChanged("ImageOnTokenPreviewMaxHeight");
                    OnPropertyChanged("ImageOnTokenPreviewMaxWidth");
                    OnPropertyChanged("SourceImagePreview");
                    OnPropertyChanged("SourceImagePreviewMaxHeight");
                    OnPropertyChanged("SourceImagePreviewMaxWidth");
                    OnPropertyChanged("SourceImage");
                    OnPropertyChanged("SourceImageButtonText");
                }
            }
        }
        public string SourceImageButtonText => (character.SourceImage == null) ? "Click to import source image" : "";

        public Bitmap ProcessedImage
        {
            get => character.ProcessedImage;
            set
            {
                if (value != character.ProcessedImage)
                {
                    cachedImagePreview = null;
                    cachedImageOnTokenPreview = null;
                    cachedSourceImagePreview = null;
                    character.SourceImage = null;
                    character.ProcessedImage = value;
                    OnPropertyChanged("ProcessedImage");
                    OnPropertyChanged("ImagePreview");
                    OnPropertyChanged("ImagePreviewMaxHeight");
                    OnPropertyChanged("ImagePreviewMaxWidth");
                    OnPropertyChanged("ImageOnTokenPreview");
                    OnPropertyChanged("ImageOnTokenPreviewMaxHeight");
                    OnPropertyChanged("ImageOnTokenPreviewMaxWidth");
                    OnPropertyChanged("SourceImagePreview");
                    OnPropertyChanged("SourceImagePreviewMaxHeight");
                    OnPropertyChanged("SourceImagePreviewMaxWidth");
                    OnPropertyChanged("SourceImage");
                    OnPropertyChanged("SourceImageButtonText");
                }
            }
        }

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

        public string FirstNightTooltip => "Ability:  " + character.Ability + "\n\n1st Night Reminder:  " + character.FirstNightReminder;
        public string OtherNightTooltip => "Ability:  " + character.Ability + "\n\nOther Night Reminder:  " + character.OtherNightReminder;

        // TODO: it is kinda just confusing to have both X and XProperty. cut down to just these binding helpers and drop the suffix
        public StringBindingHelper IdProperty { get; private set; }
        public StringBindingHelper NameProperty { get; private set; }
        public ComboBoxBindingHelper TeamProperty { get; private set; }
        public StringBindingHelper AbilityProperty { get; private set; }
        public StringBindingHelper FirstNightReminderProperty { get; private set; }
        public StringBindingHelper OtherNightReminderProperty { get; private set; }
        public BoolBindingHelper SetupProperty { get; private set; }
        public StringBindingHelper ReminderTokensProperty { get; private set; }
        public StringBindingHelper GlobalReminderTokens { get; private set; }
        public StringBindingHelper AlmanacFlavorProperty { get; private set; }
        public StringBindingHelper AlmanacOverviewProperty { get; private set; }
        public StringBindingHelper AlmanacExamplesProperty { get; private set; }
        public StringBindingHelper AlmanacHowToRunProperty { get; private set; }
        public StringBindingHelper AlmanacTipProperty { get; private set; }

        public BoolBindingHelper IncludeInExport { get; private set; }
        public StringBindingHelper Attribution { get; private set; }
        public StringBindingHelper Note { get; private set; }

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
            cachedImagePreview = null;
            cachedImageOnTokenPreview = null;
            cachedSourceImagePreview = null;
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
                "The displayed name of this character",
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
                        cachedImagePreview = null;
                        cachedImageOnTokenPreview = null;
                        cachedSourceImagePreview = null;
                        if (character.SourceImage != null)
                        {
                            character.ProcessedImage = null;
                        }
                        OnPropertyChanged("Team");
                        OnPropertyChanged("TeamProperty");
                        OnPropertyChanged("ImagePreview");
                        OnPropertyChanged("ImagePreviewMaxHeight");
                        OnPropertyChanged("ImagePreviewMaxWidth");
                        OnPropertyChanged("ImageOnTokenPreview");
                        OnPropertyChanged("ImageOnTokenPreviewMaxHeight");
                        OnPropertyChanged("ImageOnTokenPreviewMaxWidth");
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
                        OnPropertyChanged("OtherNightReminder");
                        OnPropertyChanged("OtherNightReminderProperty");
                    }
                },
                false
            );
            SetupProperty = new BoolBindingHelper(
                 "Setup",
                 "Whether this character affects setup (orange leaf), like the Drunk or Baron",
                 () => Setup,
                 (x) => { Setup = x; }
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
            GlobalReminderTokens = new StringBindingHelper(
                "Global",
                "Reminder tokens that are always available (one per line)",
                () => string.Join(Environment.NewLine, character.GlobalReminderTokens),
                (value) =>
                {
                    var tokens = from token in value.Split(new string[] { Environment.NewLine }, StringSplitOptions.None) select token;
                    character.GlobalReminderTokens = new List<string>(tokens);
                    OnPropertyChanged("GlobalReminderTokens");
                    OnPropertyChanged("GlobalReminderTokens");
                },
                true
            );
            IncludeInExport = new BoolBindingHelper(
                "Include in Export",
                "Whether this character should be included when exporting",
                () => character.IncludeInExport,
                (value) =>
                {
                    if (value != character.IncludeInExport)
                    {
                        character.IncludeInExport = value;
                        OnPropertyChanged("IncludeInExport");
                    }
                }
            );
            Note = new StringBindingHelper(
                "Note",
                "Note displayed in Bloodstar Clocktica only. Not exported.",
                () => character.Note,
                (value) =>
                {
                    if (value != character.Note)
                    {
                        character.Note = value;
                        OnPropertyChanged("Note");
                    }
                },
                true
            );
            Attribution = new StringBindingHelper(
                "Attribution",
                "Unused by clocktower.online, but included in exported JSON. Good place to give credit to image creator, for example.",
                () => character.Attribution,
                (value) =>
                {
                    if (value != character.Attribution)
                    {
                        character.Attribution = value;
                        OnPropertyChanged("Attribution");
                    }
                },
                true
            );
            AlmanacFlavorProperty = new StringBindingHelper(
                "Flavor",
                "Markdown supported!\nFlavor text for the character. For official sets, these are written as though spoken by from the character.",
                () => character.AlmanacEntry.Flavor,
                (value) =>
                {
                    if (value != character.AlmanacEntry.Flavor)
                    {
                        character.AlmanacEntry.Flavor = value;
                        OnPropertyChanged("Flavor");
                    }
                },
                true
            );

            AlmanacOverviewProperty = new StringBindingHelper(
                "Overview",
                "Markdown supported!\nTypically begins with a short, high-level description of what the character does followed by detailed clarifications of the ability.",
                () => character.AlmanacEntry.Overview,
                (value) =>
                {
                    if (value != character.AlmanacEntry.Overview)
                    {
                        character.AlmanacEntry.Overview = value;
                        OnPropertyChanged("Overview");
                    }
                },
                true
            );
            AlmanacExamplesProperty = new StringBindingHelper(
                "Examples",
                "Markdown supported!\nDescribe a few newline-separated game situations to help illustrate how the ability works and interacts with other characters.",
                () => character.AlmanacEntry.Examples,
                (value) =>
                {
                    if (value != character.AlmanacEntry.Examples)
                    {
                        character.AlmanacEntry.Examples = value;
                        OnPropertyChanged("Examples");
                    }
                },
                true
            );
            AlmanacHowToRunProperty = new StringBindingHelper(
                "How to run",
                "Markdown supported!\nDescribe what the storyteller needs to do for this character. Include anything like any additional setup (like the Washewoman's reminder tokens), or the process for waking the player at night, if they apply.",
                () => character.AlmanacEntry.HowToRun,
                (value) =>
                {
                    if (value != character.AlmanacEntry.HowToRun)
                    {
                        character.AlmanacEntry.HowToRun = value;
                        OnPropertyChanged("HowToRun");
                    }
                },
                true
            );
            AlmanacTipProperty = new StringBindingHelper(
                "Tip",
                "Markdown supported!\nNewline-separated tips for how to run the character well. Not all characters need this!\nFor example, the Ravenkeeper's reads: “We advise you to discourage or even ban players from talking about what they are doing at night as they are doing it.”",
                () => character.AlmanacEntry.Tip,
                (value) =>
                {
                    if (value != character.AlmanacEntry.Tip)
                    {
                        character.AlmanacEntry.Tip = value;
                        OnPropertyChanged("Tip");
                    }
                },
                true
            );
        }
    }
}
