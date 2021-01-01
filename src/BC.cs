using SixLabors.ImageSharp;
using System;
using System.IO;
using System.Windows.Forms;
using System.Windows.Forms.Design;

namespace BloodstarClocktica
{
    static class BC
    {
        public static SaveFile Document;
        public static MainForm Form;
        public static string TempPngName = ".bloodstarclocktica.tmp.png";

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Document = new SaveFile();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Form = new MainForm();
            Refresh();
            Application.Run(Form);
        }

        /// <summary>
        /// open a new document
        /// </summary>
        public static void OpenNew()
        {
            if (SavePromptIfDirty())
            {
                Document = new SaveFile();
                Refresh();
            }
        }

        /// <summary>
        /// open a file dialog and open the chosen document
        /// </summary>
        public static void Open()
        {
            if (SavePromptIfDirty())
            {
                var dlg = new OpenFileDialog
                {
                    Filter = "Bloodstar Clocktica files (*.blood)|*.blood",
                    RestoreDirectory = true
                };
                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    Open(dlg.FileName);
                }
            }
        }

        /// <summary>
        /// open the specified document
        /// </summary>
        /// <param name="filePath"></param>
        static void Open(string filePath)
        {
            Document = SaveFile.Load(filePath);
            Refresh();
        }

        /// <summary>
        /// update all controls to reflect document
        /// </summary>
        public static void Refresh()
        {
            RefreshMeta();
            RefreshCharacterList();
            RefreshCharacterPane();
        }

        /// <summary>
        /// update meta information controls based on document
        /// </summary>
        public static void RefreshMeta()
        {
            Form.NameTextBox.Text = Document.Meta.Name;
            Form.AuthorTextBox.Text = Document.Meta.Author;
            if (Document.Meta.Logo == null)
            {
                Form.LogoButton.BackgroundImage = null;
                Form.LogoButton.Text = "Click to choose logo";
            }
            else
            {
                var ms = new MemoryStream();
                Document.Meta.Logo.SaveAsPng(ms);
                Form.LogoButton.BackgroundImage = System.Drawing.Image.FromStream(ms);
                Form.LogoButton.Text = "";
            }
        }

        /// <summary>
        /// Prompt the user to save if the document has unsaved changes
        /// </summary>
        /// <returns>true if it is now ok to do the destructive action</returns>
        public static bool SavePromptIfDirty()
        {
            return (!Document.Dirty) || ExitPrompt();
        }

        /// <summary>
        /// called if you try to close the window whith unsaved changes
        /// </summary>
        /// <returns>true if it is now ok to do the destructive action</returns>
        public static bool ExitPrompt()
        {
            var response = DialogResult.Cancel;
            using (var dlg = new SaveDiscardCancel())
            {
                response = dlg.ShowDialog();
            }

            switch (response)
            {
                case DialogResult.Yes:
                    return Save();
                case DialogResult.No:
                    return true;
                case DialogResult.Cancel:
                    return false;
            }
            return false;
        }

        /// <summary>
        /// save document.
        /// </summary>
        /// <returns>true if it successfully saved</returns>
        public static bool Save()
        {
            string filePath = BC.Document.FilePath;
            if (filePath == null || filePath == "")
            {
                return SaveAs();
            }
            else
            {
                return SaveAs(filePath);
            }
        }

        /// <summary>
        /// prompt for file path and save document.
        /// </summary>
        /// <returns>true if it successfully saved</returns>
        public static bool SaveAs()
        {
            var dlg = new SaveFileDialog
            {
                Filter = "Bloodstar Clocktica files (*.blood)|*.blood",
                RestoreDirectory = true,
                OverwritePrompt = true
            };
            if (dlg.ShowDialog() == DialogResult.OK)
            {
                return SaveAs(dlg.FileName);
            }
            return false;
        }

        /// <summary>
        /// save document at given location
        /// </summary>
        /// <param name="path"></param>
        /// <returns>true if it successfully saved</returns>
        static bool SaveAs(string path)
        {
            try
            {
                Document.Save(path);
            }
            catch (Exception exception)
            {
                MessageBox.Show($"Exception occurred while saving: {exception.Message}\n\n{exception.StackTrace}", "Error");
                return false;
            }
            return true;
        }

        /// <summary>
        /// Choose a source image
        /// </summary>
        /// <returns>path to an image file or null</returns>
        public static string ChooseImage()
        {
            var dlg = new OpenFileDialog
            {
                Filter = "Images (*.jpg;*.png;*.bmp;*.gif)|*.jpg;*.png;*.bmp;*.gif",
                RestoreDirectory = true
            };
            if (dlg.ShowDialog() == DialogResult.OK)
            {
                return dlg.FileName;
            }
            return null;
        }

        /// <summary>
        /// add a new character to the set
        /// </summary>
        public static void AddCharacter()
        {
            Document.Roles.Add(new SaveRole());
            RefreshCharacterList();
        }

        /// <summary>
        /// Update the character list control after Document.Roles changed
        /// </summary>
        static void RefreshCharacterList()
        {
            var numCharacters = Document.Roles.Count;
            var items = Form.CharactersList.Items;
            Form.CharactersList.BeginUpdate();
            while (items.Count > numCharacters)
            {
                items.RemoveAt(items.Count-1);
            }
            for (var i=0; i<numCharacters; ++i)
            {
                if (i < items.Count)
                {
                    items[i] = Document.Roles[i].Id;
                }
                else
                {
                    items.Add(Document.Roles[i].Id);
                }
            }
            Form.CharactersList.EndUpdate();
        }

        /// <summary>
        /// Remove a character from the character list, confirming first
        /// </summary>
        /// <param name="index"></param>
        public static void PromptForRemoveCharacter(int index)
        {
            if (index == -1) { return; }
            var role = Document.Roles[index];
            if (DialogResult.Yes == MessageBox.Show($"Remove character \"{role.Id}\"?", "Confirm", MessageBoxButtons.YesNo))
            {
                RemoveCharacter(index);
            }
        }

        /// <summary>
        /// Remove a character from the character list
        /// </summary>
        /// <param name="index"></param>
        static void RemoveCharacter(int index)
        {
            if (index != -1)
            {
                Document.Roles.RemoveAt(index);
                RefreshCharacterList();
            }
        }

        /// <summary>
        /// update character controls
        /// </summary>
        public static void RefreshCharacterPane()
        {
            var index = Form.CharactersList.SelectedIndex;
            if (-1 == index)
            {
                Form.PropertyGrid.SelectedObject = null;
                return;
            }
            Form.PropertyGrid.SelectedObject = Document.Roles[index];
        }
    }
}
