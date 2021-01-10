using System.ComponentModel;

namespace BloodstarClockticaWpf
{
    class NightOrderCharacterWrapper : INotifyPropertyChanged
    {
        /// <summary>
        /// Ordinal string for when this character acts. like "1st"
        /// </summary>
        public string NightOrderOrdinal
        {
            get
            {
                var order = firstNight ? Character.FirstNightOrder : Character.OtherNightOrder;
                if (order <= 0) { return "-"; }
                return Ordinal(order);
            }
        }
        
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
                    OnPropertyChanged("NightOrderOrdinal");
                    break;
                case null:
                    OnPropertyChanged(null);
                    break;
            }
        }

        /// <summary>
        /// convert a positive integer to an ordinal like "1st"
        /// </summary>
        /// <param name="x"></param>
        /// <returns></returns>
        private static string Ordinal(int x)
        {
            if (x <= 0) { return x.ToString(); }
            switch (x)
            {
                case 11:
                case 12:
                case 13:
                    return $"{x}th";
                default:
                    switch (x % 10)
                    {
                        case 1: return $"{x}st";
                        case 2: return $"{x}nd";
                        case 3: return $"{x}rd";
                        default: return $"{x}th";
                    }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
