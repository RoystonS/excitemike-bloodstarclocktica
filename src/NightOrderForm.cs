using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    internal partial class NightOrderForm : Form
    {
        readonly bool firstNight;
        readonly List<SaveRole> sortedCharacterList;

        /// <summary>
        /// create form for editting night order
        /// </summary>
        /// <param name="title"></param>
        /// <param name="firstNight"></param>
        internal NightOrderForm(bool firstNight)
        {
            InitializeComponent();
            this.firstNight = firstNight;
            Text = firstNight ? "First Night Order & Reminders" : "Other Night Order & Reminders";
            NightReminderLabel.Text = firstNight ? "First Night Reminder" : "Other Nights Reminder";
            sortedCharacterList = new List<SaveRole>(BC.Document.Roles);
            sortedCharacterList.Sort(new NightOrderComparer(firstNight));
            UpdateDocument();
            UpdateControls();
        }

        /// <summary>
        /// update CharactersList to reflect document
        /// </summary>
        void UpdateControls()
        {
            var numCharacters = sortedCharacterList.Count;
            var items = CharactersList.Items;
            CharactersList.BeginUpdate();
            try
            {
                while (items.Count > numCharacters)
                {
                    items.RemoveAt(items.Count - 1);
                }
                while (items.Count < numCharacters)
                {
                    items.Add("");
                }

                for (var i = 0; i < numCharacters; ++i)
                {
                    var character = sortedCharacterList[i];
                    var hasReminder = firstNight ? character.HasFirstNightReminder : character.HasOtherNightReminder;
                    items[i] = character.Name;
                    UpdateCheck(i, hasReminder);
                }
                if ((CharactersList.Items.Count > 0) && (CharactersList.SelectedIndex == -1))
                {
                    CharactersList.SelectedIndex = 0;
                }
            }
            finally
            {
                CharactersList.EndUpdate();
            }
        }

        /// <summary>
        /// update the checkbox without triggering events
        /// </summary>
        /// <param name="i"></param>
        /// <param name="hasReminder"></param>
        private void UpdateCheck(int i, bool hasReminder)
        {
            CharactersList.ItemCheck -= CharactersList_ItemCheck;
            CharactersList.SetItemChecked(i, hasReminder);
            CharactersList.ItemCheck += CharactersList_ItemCheck;
        }

        /// <summary>
        /// update the textbox without triggering events
        /// </summary>
        /// <param name="s"></param>
        private void UpdateTextBox(string s)
        {
            TextBox.TextChanged -= TextBox_TextChanged;
            TextBox.Text = s;
            TextBox.TextChanged += TextBox_TextChanged;
        }

        /// <summary>
        /// update the document to reflect the new order
        /// </summary>
        void UpdateDocument()
        {
            // TODO: this should be going through BC not messing with document directly
            var orderNum = 1;
            for (var i = 0; i < sortedCharacterList.Count; ++i)
            {
                var character = sortedCharacterList[i];
                var hasReminder = firstNight ? character.HasFirstNightReminder : character.HasOtherNightReminder;
                if (hasReminder)
                {
                    if (firstNight)
                    {
                        if (character.FirstNightOrder != orderNum)
                        {
                            character.FirstNightOrder = orderNum;
                            BC.SetDirty(true);
                        }
                    }
                    else
                    {
                        if (character.OtherNightOrder != orderNum)
                        {
                            character.OtherNightOrder = orderNum;
                            BC.SetDirty(true);
                        }
                    }
                    orderNum++;
                }
                else
                {
                    if (firstNight)
                    {
                        if (character.FirstNightOrder != 0)
                        {
                            character.FirstNightOrder = 0;
                            BC.SetDirty(true);
                        }
                    }
                    else
                    {
                        if (character.OtherNightOrder != 0)
                        {
                            character.OtherNightOrder = 0;
                            BC.SetDirty(true);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// comparer used to sort by night order
        /// </summary>
        private class NightOrderComparer : Comparer<SaveRole>
        {
            readonly bool firstNight;
            public NightOrderComparer(bool firstNight)
            {
                this.firstNight = firstNight;
            }
            public override int Compare(SaveRole x, SaveRole y)
            {
                if (firstNight)
                {
                    return x.FirstNightOrder.CompareTo(y.FirstNightOrder);
                }
                return x.OtherNightOrder.CompareTo(y.OtherNightOrder);
            }
        }

        /// <summary>
        /// update checkboxes, dirty flag as text is editted
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void TextBox_TextChanged(object sender, System.EventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index != -1)
            {
                var character = sortedCharacterList[index];
                if (firstNight)
                {
                    character.FirstNightReminder = TextBox.Text;
                }
                else
                {
                    character.OtherNightReminder = TextBox.Text;
                }
                UpdateCheck(index, TextBox.Text != "");
                BC.SetDirty(true);
            }
        }

        /// <summary>
        /// update textbox as we select different characters
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CharactersList_SelectedIndexChanged(object sender, System.EventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index != -1)
            {
                var character = sortedCharacterList[index];
                if (firstNight)
                {
                    UpdateTextBox(character.FirstNightReminder);
                }
                else
                {
                    UpdateTextBox(character.OtherNightReminder);
                }
                TeamText.Text = character.Team.ToString();
                AbilityText.Text = character.Ability;
            }
        }

        /// <summary>
        /// block clicks from messing up the check mark
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CharactersList_ItemCheck(object sender, ItemCheckEventArgs e)
        {
            var character = sortedCharacterList[e.Index];
            var hasReminder = firstNight ? character.HasFirstNightReminder : character.HasOtherNightReminder;
            e.NewValue = hasReminder ? CheckState.Checked : CheckState.Unchecked;
        }

        /// <summary>
        /// change night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void MoveCharacterUpButton_Click(object sender, System.EventArgs e)
        {
            SwapOrder(-1);
        }

        /// <summary>
        /// change night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void MoveCharacterDownButton_Click(object sender, System.EventArgs e)
        {
            SwapOrder(+1);
        }

        /// <summary>
        /// change night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void SwapOrder(int offset)
        {
            var indexA = CharactersList.SelectedIndex;
            var indexB = indexA + offset;
            if ((indexA != -1) && (0 <= indexB) && (indexB < CharactersList.Items.Count))
            {
                CharactersList.BeginUpdate();
                CharactersList.SelectedIndexChanged -= new System.EventHandler(CharactersList_SelectedIndexChanged);
                try
                {
                    {
                        var temp = sortedCharacterList[indexA];
                        sortedCharacterList[indexA] = sortedCharacterList[indexB];
                        sortedCharacterList[indexB] = temp;
                    }
                    UpdateDocument();
                    UpdateControls();
                    CharactersList.SelectedIndex = indexB;
                }
                finally
                {
                    CharactersList.SelectedIndexChanged += new System.EventHandler(CharactersList_SelectedIndexChanged);
                    CharactersList.EndUpdate();
                    BC.SetDirty(true);
                }
            }
        }
    }
}
