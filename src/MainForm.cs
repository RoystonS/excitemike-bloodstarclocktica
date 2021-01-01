using System;
using System.Drawing;
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
                BC.Document.Dirty = true;
            }
        }

        private void AuthorTextBox_TextChanged(object sender, EventArgs e)
        {
            if (BC.Document.Meta.Author != (sender as TextBox).Text)
            {
                BC.Document.Meta.Author = (sender as TextBox).Text;
                BC.Document.Dirty = true;
            }
        }

        private void LogoButton_Click(object sender, EventArgs e)
        {
            var image = BC.ChooseImage();
            if (image != null)
            {
                BC.Document.Meta.Logo = SixLabors.ImageSharp.Image.Load(image);
                BC.Document.Dirty = true;
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
                BC.RefreshCharacterListItem(index);
                BC.Document.Dirty = true;
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
    }
}
