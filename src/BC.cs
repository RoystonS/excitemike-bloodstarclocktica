﻿using System;
using System.Drawing;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public static partial class BC
    {
        public static SaveFile Document;
        public static MainForm Form;
        static readonly string WindowTitle = "Bloodstar Clocktica";

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
                RefreshTitle();
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
        public static Image ChooseImage()
        {
            var dlg = new OpenFileDialog
            {
                Filter = "Images (*.jpg;*.png;*.bmp;*.gif)|*.jpg;*.png;*.bmp;*.gif",
                RestoreDirectory = true
            };
            if (dlg.ShowDialog() == DialogResult.OK)
            {
                return Image.FromFile(dlg.FileName);
            }
            return null;
        }

        /// <summary>
        /// add a new character to the set
        /// </summary>
        public static void AddCharacter()
        {
            SetDirty(true);
            Document.Roles.Add(new SaveRole());
            RefreshCharacterList();
            Form.CharactersList.SelectedIndex = Form.CharactersList.Items.Count - 1;
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
                SetDirty(true);
                Document.Roles.RemoveAt(index);
                RefreshCharacterList();
                if (Form.CharactersList.SelectedIndex == -1 && Form.CharactersList.Items.Count != 0)
                {
                    Form.CharactersList.SelectedIndex = Form.CharactersList.Items.Count - 1;
                }
            }
        }

        /// <summary>
        /// change the order of the characters
        /// </summary>
        /// <param name="index"></param>
        public static void SwapCharacters(int indexA, int indexB)
        {
            var items = Form.CharactersList.Items;
            var roles = Document.Roles;
            {
                var temp = items[indexA];
                items[indexA] = items[indexB];
                items[indexB] = temp;
            }
            {
                var temp = roles[indexA];
                roles[indexA] = roles[indexB];
                roles[indexB] = temp;
            }
            Form.CharactersList.SelectedIndex = indexB;
        }

        /// <summary>
        /// Mark the document dirty and update window title
        /// </summary>
        /// <param name="isDirty"></param>
        public static void SetDirty(bool isDirty)
        {
            Document.Dirty = isDirty;
            RefreshTitle();
        }

        /// <summary>
        /// Update window title to reflect whether document is dirty
        /// </summary>
        static void RefreshTitle()
        {
            if (Document.Dirty)
            {
                Form.Text = WindowTitle + " *";
            }
            else
            {
                Form.Text = WindowTitle;
            }
        }

        /// <summary>
        /// select a source image for the character
        /// </summary>
        /// <param name="index"></param>
        internal static void ChooseSourceImage(int index)
        {
            // TODO: should this have a confirmation popup?
            // TODO: a way to go back to no image at all
            if (-1 == index)
            {
                return;
            }
            var character = Document.Roles[index];
            var image = BC.ChooseImage();
            if (image != null)
            {
                character.SourceImage = image;
                character.ProcessedImage = null;
                SetDirty(true);
                RefreshCharacterPane();
            }
        }
    }
}
