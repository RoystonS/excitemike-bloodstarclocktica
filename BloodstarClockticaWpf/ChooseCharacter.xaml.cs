using BloodstarClockticaLib;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using static BloodstarClockticaLib.BcImport;

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
        public ObservableCollection<RolesJsonCharacter> Characters
        {
            get => (ObservableCollection<RolesJsonCharacter>)GetValue(CharactersProperty);
            set => SetValue(CharactersProperty, value);
        }
        public static readonly DependencyProperty CharactersProperty = DependencyProperty.Register(
            "Characters",
            typeof(ObservableCollection<RolesJsonCharacter>),
            typeof(ChooseCharacter),
            new PropertyMetadata(new ObservableCollection<RolesJsonCharacter>())
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

        private readonly IEnumerable<RolesJsonCharacter> allCharacters;

        /// <summary>
        /// where we store the choice made in this dialog
        /// </summary>
        private IEnumerable<RolesJsonCharacter> ChosenCharacters { get; set; }

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

        private ChooseCharacter(IEnumerable<RolesJsonCharacter> characters)
        {
            allCharacters = new List<RolesJsonCharacter>(characters);
            Characters = new ObservableCollection<RolesJsonCharacter>(allCharacters);
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
            ChosenCharacters = new List<RolesJsonCharacter>(from RolesJsonCharacter character in CharacterList.SelectedItems select character);
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
                if (character.PassesFilter(filterString))
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
                return dlg.ChosenCharacters;
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
    }
}
