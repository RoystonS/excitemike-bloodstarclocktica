using System.ComponentModel;

namespace BloodstarClockticaWpf
{
    class NightOrderCharacterWrapper : INotifyPropertyChanged
    {
        /// <summary>
        /// Ordinal string for when this character acts. like "1st"
        /// Managed by NightOrderWrapper.cs
        /// </summary>
        public string NightReminderOrdinal
        {
            get => nightReminderOrdinal;
            set
            {
                if (value != nightReminderOrdinal)
                {
                    nightReminderOrdinal = value;
                    OnPropertyChanged("NightReminderOrdinal");
                }
            }
        }
        private string nightReminderOrdinal;

        /// <summary>
        /// wrapper for other character properties
        /// </summary>
        public CharacterWrapper Character { get; private set; }

        /// <summary>
        /// which night's order this is relative to
        /// </summary>
        private readonly bool firstNight;

        /// <summary>
        /// create wrapper
        /// </summary>
        /// <param name="character"></param>
        /// <param name="firstNight"></param>
        public NightOrderCharacterWrapper(CharacterWrapper character, bool firstNight)
        {
            Character = character;
            character.PropertyChanged += Character_PropertyChanged;
            this.firstNight = firstNight;
            nightReminderOrdinal = "-";
        }

        /// <summary>
        /// when the internal character wrapper changes, this one's bindings may need refreshing, too
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Character_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            switch (e.PropertyName)
            {
                case "FirstNightOrder":
                case "OtherNightOrder":
                    OnPropertyChanged("NightReminderOrdinal");
                    break;
                case null:
                    OnPropertyChanged(null);
                    break;
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
