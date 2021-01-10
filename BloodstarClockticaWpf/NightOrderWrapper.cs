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
        public string CopyButtonLabel => IsFirstNight ? "Copy to Other Nights Reminder" : "Copy to First Night Reminder";

        /// <summary>
        /// characters in night order
        /// </summary>
        public ObservableCollection<NightOrderCharacterWrapper> SortedList { get; private set; }

        private bool updatingCharacterList;

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
        }

        /// <summary>
        /// new document means we have to refresh completely
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void DocumentWrapper_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            PopulateCharacterList();
        }

        /// <summary>
        /// populate SortedList
        /// </summary>
        public void PopulateCharacterList()
        {
            updatingCharacterList = true;
            try
            {
                SortedList.Clear();
                var characters = DocumentWrapper.CharacterList
                    .OrderBy(characterWrapper => IsFirstNight ? characterWrapper.FirstNightOrder : characterWrapper.OtherNightOrder)
                    .Select(characterWrapper => new NightOrderCharacterWrapper(characterWrapper, IsFirstNight));
                int nightCount = 0;
                foreach (var characterWrapper in characters)
                {
                    SortedList.Add(characterWrapper);

                    // correct the order numbers as we build the list
                    var reminder = IsFirstNight ? characterWrapper.Character.FirstNightReminderProperty.Value : characterWrapper.Character.OtherNightReminderProperty.Value;
                    var nightOrder = (reminder == "") ? 0 : ++nightCount;
                    if (IsFirstNight)
                    {
                        characterWrapper.Character.FirstNightOrder = nightOrder;
                    }
                    else
                    {
                        characterWrapper.Character.OtherNightOrder = nightOrder;
                    }
                }
                OnPropertyChanged("SortedList");
            }
            finally
            {
                updatingCharacterList = false;
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
