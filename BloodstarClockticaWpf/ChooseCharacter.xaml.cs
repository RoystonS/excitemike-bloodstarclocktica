using BloodstarClockticaLib;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for NightOrder.xaml
    /// </summary>
    partial class ChooseCharacter : Window
    {
        /// <summary>
        /// characters to choose from
        /// </summary>
        public ObservableCollection<ICharacterInterface> Characters
        {
            get => (ObservableCollection<ICharacterInterface>)GetValue(CharactersProperty);
            set => SetValue(CharactersProperty, value);
        }
        public static readonly DependencyProperty CharactersProperty = DependencyProperty.Register(
            "Characters",
            typeof(ObservableCollection<ICharacterInterface>),
            typeof(ChooseCharacter),
            new PropertyMetadata(new ObservableCollection<ICharacterInterface>())
        );

        /// <summary>
        /// whether any characters are presently selected
        /// </summary>
        public bool AnySelected
        {
            get => (bool)GetValue(AnySelectedProperty);
            set => SetValue(AnySelectedProperty, value);
        }
        public static readonly DependencyProperty AnySelectedProperty = DependencyProperty.Register(
            "AnySelected",
            typeof(bool),
            typeof(ChooseCharacter),
            new PropertyMetadata(false)
        );

        private readonly IEnumerable<ICharacterInterface> allCharacters;

        /// <summary>
        /// where we store the choice made in this dialog
        /// </summary>
        private IEnumerable<ICharacterInterface> ChosenCharacters { get; set; }

        /// <summary>
        /// use to filter the list
        /// </summary>
        public string FilterString
        {
            get => (string)GetValue(FilterStringProperty);
            set => SetValue(FilterStringProperty, value);
        }
        public static readonly DependencyProperty FilterStringProperty = DependencyProperty.Register(
            "FilterString",
            typeof(string),
            typeof(ChooseCharacter),
            new PropertyMetadata(
                "",
                (DependencyObject d, DependencyPropertyChangedEventArgs e) => (d as ChooseCharacter)?.UpdateCharacters(e.NewValue as string)
            ));

        private ChooseCharacter(IEnumerable<ICharacterInterface> characters)
        {
            allCharacters = new List<ICharacterInterface>(characters);
            Characters = new ObservableCollection<ICharacterInterface>(allCharacters);
            AnySelected = false;
            InitializeComponent();
        }

        /// <summary>
        /// finish the popup
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Ok_Click(object sender, RoutedEventArgs e)
        {
            ChosenCharacters = new List<ICharacterInterface>(from object character in CharacterList.SelectedItems select character as ICharacterInterface);
            DialogResult = true;
            Close();
        }

        /// <summary>
        /// leave choose character popup with no character selection
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            ChosenCharacters = null;
            Close();
        }

        /// <summary>
        /// re-filter the list of characters
        /// </summary>
        private void UpdateCharacters(string filterString)
        {
            Characters.Clear();
            foreach (var character in allCharacters)
            {
                if (PassesFilter(character, filterString))
                {
                    Characters.Add(character);
                }
            }
        }

        /// <summary>
        /// update button when selection changes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CharacterList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            AnySelected = ((CharacterList.SelectedItems != null) && (CharacterList.SelectedItems.Count != 0));
        }

        /// <summary>
        /// override in derived class to support filtering
        /// </summary>
        /// <returns></returns>
        private bool PassesFilter(ICharacterInterface character, string filterString)
        {
            return character.PassesFilter(filterString);
        }

        /// <summary>
        /// prompt the user to choose a character from the list
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<RolesJsonCharacter> Show(IEnumerable<RolesJsonCharacter> characters)
        {
            return Show(characters, null);
        }

        /// <summary>
        /// prompt the user to choose a character from the list
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<RolesJsonCharacter> Show(IEnumerable<RolesJsonCharacter> characters, Window owner)
        {
            var dlg = new ChooseCharacter(characters) { Owner = owner };
            if (true == dlg.ShowDialog())
            {
                return dlg.ChosenCharacters.Cast<RolesJsonCharacter>();
            }
            return null;
        }

        private void SelectAll_Click(object sender, RoutedEventArgs e)
        {
            CharacterList.SelectAll();
        }
        private void SelectNone_Click(object sender, RoutedEventArgs e)
        {
            CharacterList.SelectedIndex = -1;
        }

        /// <summary>
        /// prompt the user to choose a character from the list
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<BcCharacter> Show(IEnumerable<BcCharacter> characters)
        {
            return Show(characters, null);
        }

        /// <summary>
        /// prompt the user to choose a character from the list
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<BcCharacter> Show(IEnumerable<BcCharacter> characters, Window owner)
        {
            var dlg = new ChooseCharacter(characters) { Owner = owner };
            if (true == dlg.ShowDialog())
            {
                return dlg.ChosenCharacters.Cast<BcCharacter>();
            }
            return null;
        }

        /// <summary>
        /// toggle maximized/restored
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
    }
}
