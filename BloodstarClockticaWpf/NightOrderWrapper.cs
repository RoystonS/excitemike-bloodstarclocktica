using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows;
namespace BloodstarClockticaWpf
{
    class NightOrderWrapper : INotifyPropertyChanged
    {
        public DocumentWrapper DocumentWrapper { get; private set; }

        public bool IsFirstNight { get; private set; }
        public string WindowTitle => IsFirstNight ? "First Night Order & Reminders" : "Other Night Order & Reminders";
        public string NightOrderLabel => IsFirstNight ? "First Night Order" : "Other Nights Order";
        public string NightReminderLabel => IsFirstNight ? "First Night Reminder" : "Other Nights Reminder";
        public Visibility FirstNightVis => IsFirstNight ? Visibility.Visible : Visibility.Collapsed;
        public Visibility OtherNightVis => IsFirstNight ? Visibility.Collapsed : Visibility.Visible;
        public string CopyToButtonLabel => IsFirstNight ? "Copy to Other Nights Reminder" : "Copy to First Night Reminder";
        public string CopyFromButtonLabel => IsFirstNight ? "Copy from First Night Reminder" : "Copy from Other Nights Reminder";

        /// <summary>
        /// characters in night order
        /// </summary>
        public ObservableCollection<NightOrderCharacterWrapper> SortedList { get; private set; }

        public NightOrderWrapper() : this(new DocumentWrapper(), true)
        {
        }
        public NightOrderWrapper(DocumentWrapper documentWrapper, bool firstNight)
        {
            DocumentWrapper = documentWrapper;
            documentWrapper.PropertyChanged += DocumentWrapper_PropertyChanged;
            this.IsFirstNight = firstNight;
            SortedList = new ObservableCollection<NightOrderCharacterWrapper>();
            PopulateCharacterList();
            SortedList.CollectionChanged += SortedList_CollectionChanged;
        }

        private void SortedList_CollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            UpdateOrdinals();
        }

        /// <summary>
        /// new document means we have to refresh completely
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void DocumentWrapper_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == "CharacterList")
            {
                PopulateCharacterList();
            }
        }

        /// <summary>
        /// populate SortedList
        /// </summary>
        public void PopulateCharacterList()
        {
            SortedList.Clear();
            var characters = DocumentWrapper.CharacterList
                .OrderBy(characterWrapper => IsFirstNight ? characterWrapper.FirstNightOrder : characterWrapper.OtherNightOrder)
                .Select(characterWrapper => new NightOrderCharacterWrapper(characterWrapper));
            int nightCount = 0;
            int nightReminderCount = 0;
            foreach (var characterWrapper in characters)
            {
                SortedList.Add(characterWrapper);

                // correct the order numbers as we build the list
                var reminder = IsFirstNight ? characterWrapper.Character.FirstNightReminderProperty.Value : characterWrapper.Character.OtherNightReminderProperty.Value;
                var nightReminderOrder = (reminder == "") ? 0 : ++nightReminderCount;
                if (IsFirstNight)
                {
                    characterWrapper.Character.FirstNightOrder = ++nightCount;
                }
                else
                {
                    characterWrapper.Character.OtherNightOrder = ++nightCount;
                }
            }
            UpdateOrdinals();
            OnPropertyChanged("SortedList");
        }

        /// <summary>
        /// update ordinal field for all characters
        /// </summary>
        private void UpdateOrdinals()
        {
            var nightReminderCount = 0;
            foreach (var characterWrapper in SortedList)
            {
                var reminder = IsFirstNight ? characterWrapper.Character.FirstNightReminderProperty.Value : characterWrapper.Character.OtherNightReminderProperty.Value;
                characterWrapper.NightReminderOrdinal = (reminder == "") ? "-" : Ordinal(++nightReminderCount);
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

    /// <summary>
    /// comparer used to sort by night order
    /// </summary>
    class NightOrderComparer : Comparer<CharacterWrapper>
    {
        readonly bool firstNight;
        public NightOrderComparer(bool firstNight)
        {
            this.firstNight = firstNight;
        }
        public override int Compare(CharacterWrapper x, CharacterWrapper y)
        {
            if (firstNight)
            {
                return x.FirstNightOrder.CompareTo(y.FirstNightOrder);
            }
            return x.OtherNightOrder.CompareTo(y.OtherNightOrder);
        }
    }
}
