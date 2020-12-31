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

        private void Button1_Click(object sender, EventArgs e)
        {
            BC.AddCharacter();
        }
    }
}
