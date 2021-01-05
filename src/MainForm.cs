using System;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            e.Cancel = !BC.SavePromptIfDirty();
        }

        private void SaveToolStripMenuItem_Click(object sender, EventArgs e)
        {
            BC.Save();
        }

        private void SaveAsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            BC.SaveAs();
        }

        private void NewToolStripMenuItem_Click(object sender, EventArgs e)
        {
            BC.OpenNew();
        }

        private void OpenToolStripMenuItem_Click(object sender, EventArgs e)
        {
            BC.Open();
        }

        private void NameTextBox_TextChanged(object sender, EventArgs e)
        {
            if (BC.Document.Meta.Name != (sender as TextBox).Text)
            {
                BC.Document.Meta.Name = (sender as TextBox).Text;
                BC.SetDirty(true);
            }
        }

        private void AuthorTextBox_TextChanged(object sender, EventArgs e)
        {
            if (BC.Document.Meta.Author != (sender as TextBox).Text)
            {
                BC.Document.Meta.Author = (sender as TextBox).Text;
                BC.SetDirty(true);
            }
        }

        private void LogoButton_Click(object sender, EventArgs e)
        {
            var image = BC.ChooseImage();
            if (image != null)
            {
                BC.Document.Meta.Logo = image;
                BC.SetDirty(true);
            }
            BC.RefreshMeta();
        }

        private void AddCharacter_Click(object sender, EventArgs e)
        {
            BC.AddCharacter();
        }

        private void RemoveCharacter_Click(object sender, EventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index != -1)
            {
                BC.PromptForRemoveCharacter(index);
            }
        }

        private void CharactersList_SelectedIndexChanged(object sender, EventArgs e)
        {
            BC.RefreshCharacterPane();
        }

        private void PropertyGrid_PropertyValueChanged(object s, PropertyValueChangedEventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index != -1)
            {
                BC.RefreshCharacterListItem(index, e.ChangedItem.Label);
                BC.SetDirty(true);
            }
        }

        private void MoveCharacterUpButton_Click(object sender, EventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index > 0)
            {
                CharactersList.BeginUpdate();
                CharactersList.SelectedIndexChanged -= new System.EventHandler(CharactersList_SelectedIndexChanged);
                try
                {
                    BC.SwapCharacters(index, index - 1);
                }
                finally
                {
                    CharactersList.SelectedIndexChanged += new System.EventHandler(CharactersList_SelectedIndexChanged);
                    CharactersList.EndUpdate();
                }
            }
        }
        private void MoveCharacterDownButton_Click(object sender, EventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index != -1 && index < CharactersList.Items.Count -1)
            {
                CharactersList.BeginUpdate();
                CharactersList.SelectedIndexChanged -= new System.EventHandler(CharactersList_SelectedIndexChanged);
                try
                {
                    BC.SwapCharacters(index, index + 1);
                }
                finally
                {
                    CharactersList.SelectedIndexChanged += new System.EventHandler(CharactersList_SelectedIndexChanged);
                    CharactersList.EndUpdate();
                }
            }
        }

        private void SourceImageButton_Click(object sender, EventArgs e)
        {
            var index = CharactersList.SelectedIndex;
            if (index != -1)
            {
                BC.ChooseSourceImage(index);
            }
        }

        /// <summary>
        /// edit first night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void FirstNightToolStripMenuItem_Click(object sender, EventArgs e)
        {
            using (var dlg = new NightOrderForm(true))
            {
                dlg.ShowDialog(this);
                BC.RefreshCharacterPane();
            }
        }

        /// <summary>
        /// edit order for other nights
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void OtherNightsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            using (var dlg = new NightOrderForm(false))
            {
                dlg.ShowDialog(this);
                BC.RefreshCharacterPane();
            }
        }

        /// <summary>
        /// write out roles.json and image files
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ToDiskToolStripMenuItem_Click(object sender, EventArgs e)
        {
            BC.ExportToDisk();
        }
    }
}
