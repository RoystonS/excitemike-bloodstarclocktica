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
        /// text to display for the night reminder
        /// </summary>
        public string NightReminder => IsFirstNight ? Character.FirstNightReminderProperty.Value : Character.OtherNightReminderProperty.Value;

        /// <summary>
        /// wrapper for other character properties
        /// </summary>
        public CharacterWrapper Character { get; private set; }

        public bool IsFirstNight { get; private set; }

        /// <summary>
        /// create wrapper
        /// </summary>
        /// <param name="character"></param>
        public NightOrderCharacterWrapper(CharacterWrapper character, bool isFirstNight)
        {
            Character = character;
            IsFirstNight = isFirstNight;
            nightReminderOrdinal = "-";
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
