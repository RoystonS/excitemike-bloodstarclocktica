using SixLabors.ImageSharp;
using System.ComponentModel;
using System.IO;

namespace BloodstarClocktica
{
    public partial class BC
    {
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
                    items[i] = Document.Roles[i].Id;
                }
                else
                {
                    items.Add(Document.Roles[i].Id);
                }
            }
            Form.CharactersList.EndUpdate();

            // TODO: enable/disable characterlist buttons based on selection
        }

        /// <summary>
        /// Update the character list item as id changes
        /// </summary>
        /// <param name="index"></param>
        public static void RefreshCharacterListItem(int index)
        {
            if (index == -1) { return; }
            Form.CharactersList.Items[index] = Document.Roles[index].Id;
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
            }
            else
            {
                Form.SplitContainer.Panel2.Enabled = true;
                var character = Document.Roles[index];
                Form.PropertyGrid.SelectedObject = character;
                if (character == null || character.SourceImage == null)
                {
                    Form.SourceImageButton.BackgroundImage = null;
                    Form.SourceImageButton.Text = "Click to import source image";
                    Form.ProcessedImageGroupBox.BackgroundImage = null;
                }
                else
                {
                    Form.SourceImageButton.BackgroundImage = character.SourceImage;
                    Form.ProcessedImageGroupBox.BackgroundImage = character.ProcessedImage;
                    Form.SourceImageButton.Text = "";
                }
                if (Form.PropertyGrid.SelectedObject is SaveRole saveRole)
                {
                    saveRole.ReminderTokens.ListChanged += MarkDirty;
                }
                AddListListeners();
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
                Document.Dirty = true;
            }
        }
    }
}
