using System.Windows;
using System.Windows.Controls;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for NightOrderList.xaml
    /// </summary>
    public partial class NightOrderList : UserControl
    {
        public NightOrderList()
        {
            InitializeComponent();
        }

        public string ReminderColumnLabel {
            get
            {
                if (DataContext is NightOrderWrapper now)
                {
                    var isFirstNight = now.IsFirstNight;
                    var characterList = now.SortedList;
                    if (characterList.Count > 0)
                    {
                        var character = characterList[0];
                        var prefix = isFirstNight ? character.Character.FirstNightReminderProperty.Name : character.Character.OtherNightReminderProperty.Name;
                        return $"{prefix} Reminder";
                    }
                }
                return "";
            }
        }

        private void SwapOrder(int indexA, int indexB)
        {
            if (DataContext is NightOrderWrapper now)
            {
                var isFirstNight = now.IsFirstNight;
                var characterList = now.SortedList;
                var numCharacters = characterList.Count;
                if ((0 <= indexA) && (indexA < numCharacters) && (0 <= indexB) && (indexB < numCharacters))
                {
                    var characterA = characterList[indexA].Character;
                    var characterB = characterList[indexB].Character;

                    // swap in UI
                    {
                        characterList.Move(indexA, indexB);
                    }

                    // swap night order values
                    if (isFirstNight)
                    {
                        if ((characterA.FirstNightOrder != 0) && (characterB.FirstNightOrder != 0))
                        {
                            var temp = characterA.FirstNightOrder;
                            characterA.FirstNightOrder = characterB.FirstNightOrder;
                            characterB.FirstNightOrder = temp;
                        }
                    }
                    else
                    {
                        if ((characterA.OtherNightOrder != 0) && (characterB.OtherNightOrder != 0))
                        {
                            var temp = characterA.OtherNightOrder;
                            characterA.OtherNightOrder = characterB.OtherNightOrder;
                            characterB.OtherNightOrder = temp;
                        }
                    }
                    CharacterList.SelectedIndex = indexB;
                    CharacterList.ScrollIntoView(CharacterList.SelectedItem);
                    CharacterList.Focus();
                }
            }
        }

        /// <summary>
        /// adjust night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void UpButton_Click(object sender, RoutedEventArgs e)
        {
            var index = CharacterList.SelectedIndex;
            SwapOrder(index, index - 1);
        }

        /// <summary>
        /// adjust night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void DownButton_Click(object sender, RoutedEventArgs e)
        {
            var index = CharacterList.SelectedIndex;
            SwapOrder(index, index + 1);
        }
    }
}
