using System.ComponentModel;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public static partial class BC
    {
        /// <summary>
        /// update all controls to reflect document
        /// </summary>
        public static void Refresh()
        {
            RefreshTitle();
            RefreshMeta();
            RefreshCharacterList();
            RefreshCharacterPane();
        }

        /// <summary>
        /// update meta information controls based on document
        /// </summary>
        public static void RefreshMeta()
        {
            if (MainForm == null) { return; }
            MainForm.NameTextBox.Text = Document.Meta.Name;
            MainForm.AuthorTextBox.Text = Document.Meta.Author;
            if (Document.Meta.Logo == null)
            {
                MainForm.LogoButton.BackgroundImage = null;
                MainForm.LogoButton.Text = "Click to choose logo";
            }
            else
            {
                var ms = new MemoryStream();
                Document.Meta.Logo.Save(ms, ImageFormat.Png);
                MainForm.LogoButton.BackgroundImage = System.Drawing.Image.FromStream(ms);
                MainForm.LogoButton.Text = "";
            }
        }

        /// <summary>
        /// Update the character list control after Document.Roles changed
        /// </summary>
        static void RefreshCharacterList()
        {
            if (MainForm == null) { return; }
            var numCharacters = Document.Roles.Count;
            var items = MainForm.CharactersList.Items;
            MainForm.CharactersList.BeginUpdate();
            while (items.Count > numCharacters)
            {
                items.RemoveAt(items.Count - 1);
            }
            for (var i = 0; i < numCharacters; ++i)
            {
                if (i < items.Count)
                {
                    items[i] = GetCharacterListString(Document.Roles[i]);
                }
                else
                {
                    items.Add(GetCharacterListString(Document.Roles[i]));
                }
            }
            MainForm.CharactersList.EndUpdate();

            if ((MainForm.CharactersList.Items.Count > 0) && (MainForm.CharactersList.SelectedIndex == -1))
            {
                MainForm.CharactersList.SelectedIndex = 0;
            }

            // TODO: enable/disable characterlist buttons based on selection
        }

        /// <summary>
        /// Update the character list item as id changes
        /// </summary>
        /// <param name="index"></param>
        public static void RefreshCharacterListItem(int index, string changedItemLabel)
        {
            if (index == -1) { return; }
            var character = Document.Roles[index];
            MainForm.CharactersList.Items[index] = GetCharacterListString(character);
            if ((changedItemLabel == "Team") && (character.SourceImage != null))
            {
                character.ProcessedImage = null;
                RefreshCharacterImages(character);
            }
        }

        /// <summary>
        /// update character controls
        /// </summary>
        public static void RefreshCharacterPane()
        {
            if (MainForm == null) { return; }
            ClearListListeners();
            var index = MainForm.CharactersList.SelectedIndex;
            if (-1 == index)
            {
                MainForm.PropertyGrid.SelectedObject = null;
                MainForm.SplitContainer.Panel2.Enabled = false;
                RefreshCharacterImages(null);
            }
            else
            {
                MainForm.SplitContainer.Panel2.Enabled = true;
                var character = Document.Roles[index];
                MainForm.PropertyGrid.SelectedObject = character;
                RefreshCharacterImages(character);
                if (MainForm.PropertyGrid.SelectedObject is SaveRole saveRole)
                {
                    saveRole.ReminderTokens.ListChanged += MarkDirty;
                }
                AddListListeners();
            }
        }

        /// <summary>
        /// update controls for character images
        /// </summary>
        internal static void RefreshCharacterImages(SaveRole character)
        {
            if (character == null || character.SourceImage == null)
            {
                MainForm.SourceImageButton.BackgroundImage = null;
                MainForm.SourceImageButton.Text = "Click to import source image";
                MainForm.ProcessedImagePanel.BackgroundImage = null;
            }
            else
            {
                MainForm.SourceImageButton.BackgroundImage = character.SourceImage;
                try
                {
                    MainForm.ProcessedImagePanel.BackgroundImage = character.ProcessedImage;
                }
                catch (BcImageProcessingException e)
                {
                    MessageBox.Show($"{e.Message}\n\n{e.StackTrace}", "Image processing error");
                }
                MainForm.SourceImageButton.Text = "";
            }
        }

        /// <summary>
        /// workaround for the propertygrid not sending PropertyValueChanged events in some cases
        /// </summary>
        static void AddListListeners()
        {
            // clear listeners
            if (MainForm.PropertyGrid.SelectedObject is SaveRole saveRole)
            {
                saveRole.ReminderTokens.ListChanged += MarkDirty;
                saveRole.GlobalReminderTokens.ListChanged += MarkDirty;
            }
        }

        /// <summary>
        /// clean up after AddListListeners
        /// </summary>
        static void ClearListListeners()
        {
            // clear listeners
            if (MainForm.PropertyGrid.SelectedObject is SaveRole saveRole)
            {
                saveRole.ReminderTokens.ListChanged -= MarkDirty;
                saveRole.GlobalReminderTokens.ListChanged -= MarkDirty;
            }
        }

        /// <summary>
        /// workaround for the propertygrid not sending PropertyValueChanged events in some cases
        /// </summary>
        static void MarkDirty(object _o, ListChangedEventArgs _e)
        {
            var index = MainForm.CharactersList.SelectedIndex;
            if (index != -1)
            {
                SetDirty(true);
            }
        }

        /// <summary>
        /// get what to show in the character list for the character
        /// </summary>
        /// <param name="character"></param>
        /// <returns></returns>
        static string GetCharacterListString(SaveRole character)
        {
            return $"{character.Name}";
        }
    }
}
