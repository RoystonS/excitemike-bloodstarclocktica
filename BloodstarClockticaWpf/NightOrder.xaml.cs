using System.Windows;
using System.Windows.Controls;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for NightOrder.xaml
    /// </summary>
    partial class NightOrder : Window
    {
        public NightOrder(object dataContext)
        {
            InitializeComponent();
            DataContext = dataContext;
        }

        /// <summary>
        /// leave night order view
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        /// <summary>
        /// minimize
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Minimize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        /// <summary>
        /// maximize/restore
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void MaximizeRestore_Click(object sender, RoutedEventArgs e)
        {
            if (this.WindowState == WindowState.Maximized)
            {
                this.WindowState = WindowState.Normal;
            }
            else
            {
                this.WindowState = WindowState.Maximized;
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

        /// <summary>
        /// Convenience thing for characters whose first+other night reminders are the same
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CopyToButton_Click(object sender, RoutedEventArgs e)
        {
            if (DataContext is NightOrderWrapper now)
            {
                var firstNight = now.IsFirstNight;
                if (sender is Button b)
                {
                    if (b.DataContext is NightOrderCharacterWrapper nocw)
                    {
                        var character = nocw.Character;
                        if (firstNight)
                        {
                            character.OtherNightReminderProperty.Value = character.FirstNightReminderProperty.Value;
                        }
                        else
                        {
                            character.FirstNightReminderProperty.Value = character.OtherNightReminderProperty.Value;
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Convenience thing for characters whose first+other night reminders are the same
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CopyFromButton_Click(object sender, RoutedEventArgs e)
        {
            if (DataContext is NightOrderWrapper now)
            {
                var firstNight = now.IsFirstNight;
                if (sender is Button b)
                {
                    if (b.DataContext is NightOrderCharacterWrapper nocw)
                    {
                        var character = nocw.Character;
                        if (firstNight)
                        {
                            character.FirstNightReminderProperty.Value = character.OtherNightReminderProperty.Value;
                        }
                        else
                        {
                            character.OtherNightReminderProperty.Value = character.FirstNightReminderProperty.Value;
                        }
                    }
                }
            }
        }
    }
}
