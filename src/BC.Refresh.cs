using System.ComponentModel;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    internal static partial class BC
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
                Document.Meta.Logo.Save(ms, ImageFormat.Png);
                Form.LogoButton.BackgroundImage = System.Drawing.Image.FromStream(ms);
                Form.LogoButton.Text = "";
            }
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
            Form.CharactersList.EndUpdate();

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
            Form.CharactersList.Items[index] = GetCharacterListString(character);
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
            ClearListListeners();
            var index = Form.CharactersList.SelectedIndex;
            if (-1 == index)
            {
                Form.PropertyGrid.SelectedObject = null;
                Form.SplitContainer.Panel2.Enabled = false;
                RefreshCharacterImages(null);
            }
            else
            {
                Form.SplitContainer.Panel2.Enabled = true;
                var character = Document.Roles[index];
                Form.PropertyGrid.SelectedObject = character;
                RefreshCharacterImages(character);
                if (Form.PropertyGrid.SelectedObject is SaveRole saveRole)
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
                Form.SourceImageButton.BackgroundImage = null;
                Form.SourceImageButton.Text = "Click to import source image";
                Form.ProcessedImagePanel.BackgroundImage = null;
            }
            else
            {
                Form.SourceImageButton.BackgroundImage = character.SourceImage;
                try
                {
                    Form.ProcessedImagePanel.BackgroundImage = character.ProcessedImage;
                }
                catch (BcImageProcessingException e)
                {
                    MessageBox.Show($"{e.Message}\n\n{e.StackTrace}", "Image processing error");
                }
                Form.SourceImageButton.Text = "";
            }
        }

        /// <summary>
        /// workaround for the propertygrid not sending PropertyValueChanged events in some cases
        /// </summary>
        static void AddListListeners()
        {
            // clear listeners
            if (Form.PropertyGrid.SelectedObject is SaveRole saveRole)
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
            if (Form.PropertyGrid.SelectedObject is SaveRole saveRole)
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
            var index = Form.CharactersList.SelectedIndex;
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
