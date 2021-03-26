using BloodstarClockticaLib;
using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media.Effects;
using static BloodstarClockticaLib.BcImport;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public static readonly string BaseTitle = "Bloodstar Clocktica";

        public MainWindow() : this(new BcDocument())
        {
        }
        public MainWindow(BcDocument document)
        {
            InitializeComponent();
            DataContext = new DocumentWrapper(document);
            FixCharacterListSelection(0);

            UpdateRecentDocumentsMenu();
        }

        /// <summary>
        /// interrupt window close for save prompt
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            e.Cancel = !SavePromptIfDirty();
        }

        /// <summary>
        /// prompt for save if dirty, begin new document
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void NewFile(object sender, ExecutedRoutedEventArgs e)
        {
            if (SavePromptIfDirty())
            {
                (DataContext as DocumentWrapper).SetDocument(new BcDocument());
            }
        }

        /// <summary>
        /// prompt for save if dirty, prompt for path to open, open
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void OpenFile(object sender, ExecutedRoutedEventArgs e)
        {
            if (SavePromptIfDirty())
            {
                OpenFileNoSavePrompt();
            }
        }

        /// <summary>
        /// prompt for path to open, open it
        /// </summary>
        /// <returns></returns>
        private void OpenFileNoSavePrompt()
        {
            var docDir = Properties.Settings.Default.DocumentDir;
            if (docDir == null)
            {
                docDir = "";
            }
            var dlg = new OpenFileDialog
            {
                Filter = "Bloodstar Clocktica files (*.blood)|*.blood|All files (*.*)|*.*",
                InitialDirectory = docDir
            };
            if (true == DoBlurred(() => dlg.ShowDialog(this)))
            {
                OpenNoPrompts(dlg.FileName);
            }
        }

        /// <summary>
        /// open a document from a file
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        internal void OpenNoPrompts(string filePath)
        {
            CharacterList.UnselectAll();
            CharacterList.SelectedIndex = -1;
            CharacterList.Focus();
            BcDocument document;
            try
            {
                document = new BcDocument(filePath);
            }
            catch (InvalidDataException)
            {
                BcMessageBox.Show("Invalid Data", $"File \"{filePath}\" does not appear to be a valid Bloodstar Clocktica save file.", this);
                return;
            }
            if (document != null)
            {
                AddToRecentDocuments(filePath);
                (DataContext as DocumentWrapper).SetDocument(document);
                FixCharacterListSelection(0);
            }
        }

        /// <summary>
        /// update Recent Documents list
        /// </summary>
        /// <param name="filePath"></param>
        private void AddToRecentDocuments(string filePath)
        {
            if (null == Properties.Settings.Default.RecentFiles)
            {
                Properties.Settings.Default.RecentFiles = new System.Collections.Specialized.StringCollection();
            }
            var recentFiles = Properties.Settings.Default.RecentFiles;
            recentFiles.Insert(0, filePath);

            // truncate
            while (recentFiles.Count > 9)
            {
                recentFiles.RemoveAt(recentFiles.Count - 1);
            }

            // remove duplicates
            int i = 0;
            while (i < recentFiles.Count)
            {
                var toRemove = recentFiles[i];
                int j = i + 1;
                while (j < recentFiles.Count)
                {
                    if (toRemove == recentFiles[j])
                    {
                        recentFiles.RemoveAt(j);
                    }
                    else
                    {
                        j++;
                    }
                }
                i++;
            }
            Properties.Settings.Default.Save();

            UpdateRecentDocumentsMenu();
        }

        /// <summary>
        /// update Recent Documents list
        /// </summary>
        /// <param name="filePath"></param>
        private void RemoveFromRecentDocuments(string filePath)
        {
            if (null == Properties.Settings.Default.RecentFiles)
            {
                Properties.Settings.Default.RecentFiles = new System.Collections.Specialized.StringCollection();
            }
            var recentFiles = Properties.Settings.Default.RecentFiles;
            recentFiles.Remove(filePath);
            Properties.Settings.Default.Save();

            UpdateRecentDocumentsMenu();
        }

        /// <summary>
        /// update recent documents menu
        /// </summary>
        private void UpdateRecentDocumentsMenu()
        {
            if (null == Properties.Settings.Default.RecentFiles)
            {
                Properties.Settings.Default.RecentFiles = new System.Collections.Specialized.StringCollection();
            }

            int i = 1;
            RecentFilesMenuItem.ItemsSource = from string x in Properties.Settings.Default.RecentFiles select $"_{i++} {x}";
            RecentFilesMenuItem.Visibility = (RecentFilesMenuItem.HasItems) ? Visibility.Visible : Visibility.Collapsed;
        }

        /// <summary>
        /// Save changes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void SaveFile(object sender, ExecutedRoutedEventArgs e)
        {
            SaveFile();
        }

        /// <summary>
        /// Save changes
        /// </summary>
        private bool SaveFile()
        {
            string path = (DataContext as DocumentWrapper).FilePath;
            if ((path == null) || (path == ""))
            {
                path = PromptForSaveLocation();
            }
            if (path == null)
            {
                return false;
            }
            AddToRecentDocuments(path);
            UpdateNightOrder();

            return (DataContext as DocumentWrapper).Save(path);
        }

        /// <summary>
        /// Save changes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void SaveFileAs(object sender, ExecutedRoutedEventArgs e)
        {
            SaveFileAs();
        }

        /// <summary>
        /// Save changes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private bool SaveFileAs()
        {
            var path = PromptForSaveLocation();
            if (null == path) { return false; }

            AddToRecentDocuments(path);
            UpdateNightOrder();
            return (DataContext as DocumentWrapper).Save(path);
        }

        /// <summary>
        /// choose where to save
        /// </summary>
        /// <returns>null if cancelled</returns>
        private string PromptForSaveLocation()
        {
            var docDir = Properties.Settings.Default.DocumentDir;
            if (docDir == null)
            {
                docDir = "";
            }
            var dlg = new SaveFileDialog
            {
                Filter = "Bloodstar Clocktica files (*.blood)|*.blood|All files (*.*)|*.*",
                RestoreDirectory = true,
                OverwritePrompt = true,
                InitialDirectory = docDir
            };
            if (true == DoBlurred(() => dlg.ShowDialog(this)))
            {
                return dlg.FileName;
            }
            return null;
        }

        /// <summary>
        /// bring up save/discard/cancel popup, saves if they choose it
        /// </summary>
        /// <returns>whether it is ok to continue with destructive action</returns>
        private bool DoSavePrompt()
        {
            SaveDiscardCancel dlg = new SaveDiscardCancel
            {
                Owner = this
            };
            DoBlurred(() => dlg.ShowDialog());
            switch (dlg.Result)
            {
                case SaveDiscardCancelResult.Cancel:
                    return false;
                case SaveDiscardCancelResult.Save:
                    return SaveFile();
                case SaveDiscardCancelResult.Discard:
                    return true;
            }
            throw new Exception("Unreachable");
        }

        /// <summary>
        /// Prompt the user to save if the document has unsaved changes
        /// </summary>
        /// <returns>true if it is now ok to do the destructive action</returns>
        private bool SavePromptIfDirty()
        {
            return (!(DataContext as DocumentWrapper).Dirty) || DoSavePrompt();
        }

        private void LogoButton_Click(object sender, RoutedEventArgs e)
        {
            var path = ChooseImage();
            if (path == null) { return; }
            using (var temp = System.Drawing.Image.FromFile(path))
            {
                (DataContext as DocumentWrapper).Logo = new Bitmap(temp);
            }
        }

        private void RemoveLogoButton_Click(object sender, RoutedEventArgs e)
        {
            (DataContext as DocumentWrapper).Logo = null;
        }

        private string ChooseImage()
        {
            var dlg = new OpenFileDialog
            {
                Filter = "Images (*.jpg;*.png;*.bmp;*.gif)|*.jpg;*.png;*.bmp;*.gif|All files (*.*)|*.*"
            };
            if (true == DoBlurred(() => dlg.ShowDialog(this)))
            {
                return dlg.FileName;
            }
            return null;
        }

        private void UpButton_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var index = CharacterList.SelectedIndex;
            if ((index != -1) && (index > 0))
            {
                docWrapper.SwapCharacterOrder(index, index - 1);
                CharacterList.SelectedIndex = index - 1;
                CharacterList.ScrollIntoView(CharacterList.SelectedItem);
                CharacterList.Focus();
            }
        }
        private void DownButton_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var index = CharacterList.SelectedIndex;
            if ((index != -1) && (index < docWrapper.CharacterList.Count - 1))
            {
                docWrapper.SwapCharacterOrder(index, index + 1);
                CharacterList.SelectedIndex = index + 1;
                CharacterList.ScrollIntoView(CharacterList.SelectedItem);
                CharacterList.Focus();
            }
        }
        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            docWrapper.AddCharacter();
            CharacterList.SelectedIndex = docWrapper.CharacterList.Count - 1;
            CharacterList.ScrollIntoView(CharacterList.SelectedItem);
            CharacterList.Focus();
            UpdateNightOrder();
        }
        private void DelButton_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var index = CharacterList.SelectedIndex;
            docWrapper.RemoveCharacter(index);
            FixCharacterListSelection(index);
            UpdateNightOrder();
        }

        private void FixCharacterListSelection(int preferred)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            if (CharacterList.SelectedIndex == -1 && CharacterList.Items.Count != 0)
            {
                CharacterList.SelectedIndex = Math.Max(0, Math.Min(preferred, docWrapper.CharacterList.Count - 1));
                CharacterList.ScrollIntoView(CharacterList.SelectedItem);
                CharacterList.Focus();
            }
        }

        private void SourceImageButton_Click(object sender, RoutedEventArgs e)
        {
            var path = ChooseImage();
            if (path == null) { return; }
            var docWrapper = (DataContext as DocumentWrapper);
            var charWrapper = (CharacterList.SelectedItem as CharacterWrapper);
            using (var temp = System.Drawing.Image.FromFile(path))
            {
                charWrapper.SourceImage = new Bitmap(temp);
            }
            docWrapper.Dirty = true;
        }

        private void Minimize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private void MaximizeRestore_Click(object sender, RoutedEventArgs e)
        {
            if (this.WindowState == WindowState.Maximized)
            {
                this.WindowState = WindowState.Normal;
            }
            else
            {
                this.WindowState = WindowState.Maximized;
            }
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        /// <summary>
        /// Export files for uploading wherever however
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ExportToDisk(object sender, ExecutedRoutedEventArgs e)
        {
            var imageUrlPrefix = PromptForImageUrlPrefix();
            if (null != imageUrlPrefix)
            {
                var folder = PromptForFolder();
                if (null != folder)
                {
                    UpdateNightOrder();
                    (DataContext as DocumentWrapper).ExportToDisk(folder, imageUrlPrefix);
                }
            }
        }

        /// <summary>
        /// ask for an export folder
        /// </summary>
        /// <returns></returns>
        private string PromptForFolder()
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var folderDialog = new OpenFileDialog
            {
                ValidateNames = false,
                CheckFileExists = false,
                CheckPathExists = true,
                FileName = "Folder Selection.",
                Title = "Select Directory for Export",
                InitialDirectory = docWrapper.ExportToDiskPath
            };
            if (true != DoBlurred(() => folderDialog.ShowDialog(this)))
            {
                return null;
            }
            var folder = Path.GetDirectoryName(folderDialog.FileName);
            docWrapper.ExportToDiskPath = folder;
            return folder;
        }

        /// <summary>
        /// prompt for the imageUrlPrefix to use when exporting to disk
        /// </summary>
        /// <returns></returns>
        private string PromptForImageUrlPrefix()
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var urlPrefix = docWrapper.ExportToDiskImageUrlPrefix;
            var defaultPrefix = $"https://example.com/botc/{docWrapper.Name}/images/";
            if ("" == urlPrefix)
            {
                urlPrefix = defaultPrefix;
            }
            var dlg = new StringDialog("Image URL Prefix", $"Enter a prefix for urls (e.g. {defaultPrefix})", urlPrefix)
            {
                Owner = this
            };
            DoBlurred(() => dlg.ShowDialog());
            return dlg.Result;
        }

        /// <summary>
        /// Upload
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ExportToSftp(object sender, ExecutedRoutedEventArgs e)
        {
            var dlg = new UploadDialog(DataContext as DocumentWrapper)
            {
                Owner = this
            };
            UpdateNightOrder();
            DoBlurred(() => dlg.ShowDialog());
        }

        /// <summary>
        /// menu callback version of Close
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Close(object sender, ExecutedRoutedEventArgs e)
        {
            Close();
        }

        /// <summary>
        /// blur the window while doing something
        /// </summary>
        /// <param name="f"></param>
        private T DoBlurred<T>(Func<T> f)
        {
            try
            {
                Effect = new BlurEffect
                {
                    Radius = 5
                };
                return f();
            }
            finally
            {
                Effect = null;
            }
        }

        /// <summary>
        /// open file from recent files
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void RecentFilesMenuItem_Click(object sender, RoutedEventArgs e)
        {
            if (e.OriginalSource is MenuItem menuItem)
            {
                if (menuItem.Header is string header)
                {
                    var filePath = header.Split(new char[] { ' ' }, 2)[1];
                    if (SavePromptIfDirty())
                    {
                        try
                        {
                            OpenNoPrompts(filePath);
                        }
                        catch (FileNotFoundException)
                        {
                            BcMessageBox.Show("File Not Found", $"File \"{filePath}\" appears to be missing. Removing from recent files.", this);
                            RemoveFromRecentDocuments(filePath);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Add a character by copying an offical character
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CloneOfficialMenuItem_Click(object _sender, RoutedEventArgs _e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var characters = DoBlurred(() =>
            {
                var choices = ChooseCharacter.Show(BcOfficial.OfficialCharacters, this);
                if (choices != null)
                {
                    var ids = (from character in choices select character.Id).ToList();
                    return WithProgressPopup("Downloading Character Images...", (progress) => docWrapper.CloneOfficialCharacters(ids, progress));
                }
                return null;
            });
            if (null != characters)
            {
                docWrapper.AddCharacters(characters);
                CharacterList.SelectedIndex = docWrapper.CharacterList.Count - 1;
                CharacterList.Focus();
            }
        }

        /// <summary>
        /// show a progress popup while doing something
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="title"></param>
        /// <param name="f"></param>
        /// <returns></returns>
        private T WithProgressPopup<T>(string title, Func<IProgress<double>, T> f)
        {
            var progressWindow = new ProgressDialog
            {
                Owner = this,
                Title = title
            };
            var progress = new Progress<double>(fraction => progressWindow.Value = fraction);
            var work = Task.Run(() =>
            {
                var result = f(progress);
                Dispatcher.BeginInvoke((Action)(() =>
                {
                    progressWindow.Closing -= BlockClosing;
                    progressWindow.Close();
                }));
                return result;
            });
            try
            {
                progressWindow.Closing += BlockClosing;
                progressWindow.ShowDialog();
                // the wait here is just because it's nice if we get to see the progessbar in its full state for a moment
                var result = work.Result;
                Task.Delay(10).Wait();
                return result;
            }
            finally
            {
                progressWindow.Closing -= BlockClosing;
                progressWindow.Close();
            }
        }

        /// <summary>
        /// Add character(s) from a pre-existing roles.json
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ImportFromRolesJson_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var characters = DoBlurred(() =>
            {
                var dlg = new OpenFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*"
                };
                if (true == dlg.ShowDialog(this))
                {
                    IEnumerable<RolesJsonCharacter> foundCharacters;
                    try
                    {
                        foundCharacters = ParseRolesJsonFromFile(dlg.FileName);
                    }
                    catch (InvalidDataException)
                    {
                        BcMessageBox.Show("Invalid Data", $"File \"{dlg.FileName}\" does not appear to be a JSON file", this);
                        return null;
                    }
                    if (null != foundCharacters)
                    {
                        var choices = ChooseCharacter.Show(foundCharacters, this);
                        if (choices != null)
                        {
                            return WithProgressPopup("Downloading Character Images...", (progress) => docWrapper.ImportCharacters(choices, progress));
                        }
                    }
                }
                return null;
            });
            if (null != characters)
            {
                docWrapper.AddCharacters(characters);
                CharacterList.SelectedIndex = docWrapper.CharacterList.Count - 1;
                CharacterList.Focus();
            }
        }

        /// <summary>
        /// Add character(s) from a Bloodstar Clocktica file
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ImportFromBlood_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var characters = DoBlurred(() =>
            {
                var docDir = Properties.Settings.Default.DocumentDir;
                if (docDir == null)
                {
                    docDir = "";
                }
                var dlg = new OpenFileDialog
                {
                    Filter = "Bloodstar Clocktica files (*.blood)|*.blood|All files (*.*)|*.*",
                    InitialDirectory = docDir
                };
                if (true == dlg.ShowDialog(this))
                {
                    BcDocument document;
                    try
                    {
                        document = new BcDocument(dlg.FileName);
                    }
                    catch (InvalidDataException)
                    {
                        BcMessageBox.Show("Invalid Data", $"File \"{dlg.FileName}\" does not appear to be a Bloodstar Clocktica file", this);
                        return null;
                    }
                    if (null != document)
                    {
                        var choices = ChooseCharacter.Show(document.Characters, this);
                        if (choices != null)
                        {
                            return docWrapper.ImportCharacters(choices);
                        }
                    }
                }
                return null;
            });
            if (null != characters)
            {
                docWrapper.AddCharacters(characters);
                CharacterList.SelectedIndex = docWrapper.CharacterList.Count - 1;
                CharacterList.Focus();
            }
        }

        /// <summary>
        /// set as Closing event handler to block a window from closing
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private static void BlockClosing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            e.Cancel = true;
        }

        /// <summary>
        /// remove character image
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void RemoveProcessed_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var charWrapper = (CharacterList.SelectedItem as CharacterWrapper);
            charWrapper.ProcessedImage = null;
            docWrapper.Dirty = true;
        }

        /// <summary>
        /// import an image to use as the final character image
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ImportCharacterImage_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var charWrapper = (CharacterList.SelectedItem as CharacterWrapper);
            var path = ChooseImage();
            if (path == null) { return; }
            charWrapper.SourceImage = null;
            using (var temp = System.Drawing.Image.FromFile(path))
            {
                charWrapper.ProcessedImage = new Bitmap(temp);
            }
            docWrapper.Dirty = true;
        }

        /// <summary>
        /// remove source image
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void RemoveSourceImage_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var charWrapper = (CharacterList.SelectedItem as CharacterWrapper);
            charWrapper.SourceImage = null;
            docWrapper.Dirty = true;
        }

        /// <summary>
        /// update night order fields
        /// </summary>
        private void UpdateNightOrder()
        {
            var docWrapper = (DataContext as DocumentWrapper);
            {
                var firstNightCharacters = docWrapper.CharacterList
                    .OrderBy(characterWrapper => characterWrapper.FirstNightOrder);
                int nightCount = 0;
                foreach (var characterWrapper in firstNightCharacters)
                {
                    characterWrapper.FirstNightOrder = ++nightCount;
                }
            }
            {
                var otherNightCharacters = docWrapper.CharacterList
                    .OrderBy(characterWrapper => characterWrapper.OtherNightOrder);
                int nightCount = 0;
                foreach (var characterWrapper in otherNightCharacters)
                {
                    characterWrapper.OtherNightOrder = ++nightCount;
                }
            }
        }
    }
}
