using BloodstarClockticaLib;
using Microsoft.Win32;
using System;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private bool firstNightWindowOpen;
        private bool otherNightWindowOpen;
        public static readonly string BaseTitle = "Bloodstar Clocktica";
        public MainWindow() : this(new BcDocument())
        {
        }
        public MainWindow(BcDocument document)
        {
            InitializeComponent();
            firstNightWindowOpen = false;
            otherNightWindowOpen = false;
            DataContext = new DocumentWrapper(document);
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
                var nextDoc = OpenFileNoSavePrompt();
                if (nextDoc != null)
                {
                    (DataContext as DocumentWrapper).SetDocument(nextDoc);
                    FixCharacterListSelection(0);
                }
            }
        }

        /// <summary>
        /// prompt for path to open, open it
        /// </summary>
        /// <returns></returns>
        private BcDocument OpenFileNoSavePrompt()
        {
            var docDir = Properties.Settings.Default.DocumentDir;
            if (docDir == null)
            {
                docDir = "";
            }
            var dlg = new OpenFileDialog
            {
                Filter = "Bloodstar Clocktica files (*.blood)|*.blood",
                InitialDirectory = docDir
            };
            if (true == DoBlurred(() => dlg.ShowDialog()))
            {
                return OpenNoPrompts(dlg.FileName);
            }
            return null;
        }

        /// <summary>
        /// open a document from a file
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        internal BcDocument OpenNoPrompts(string filePath)
        {
            CharacterList.UnselectAll();
            CharacterList.SelectedIndex = -1;
            CharacterList.Focus();
            var document = new BcDocument(filePath);
            return document;
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
                Filter = "Bloodstar Clocktica files (*.blood)|*.blood",
                RestoreDirectory = true,
                OverwritePrompt = true,
                InitialDirectory = docDir
            };
            if (true == DoBlurred(() => dlg.ShowDialog()))
            {
                return dlg.FileName;
            }
            return null;
        }

        /// <summary>
        /// open editor for first night order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void FirstNight(object sender, ExecutedRoutedEventArgs e)
        {
            if (firstNightWindowOpen) { return; }
            var nightOrderWrapper = new NightOrderWrapper(DataContext as DocumentWrapper, true);
            NightOrder dlg = new NightOrder(nightOrderWrapper)
            {
                Owner = this,
                ShowActivated = true
            };
            dlg.Closed += (object _s, EventArgs _e) => { firstNightWindowOpen = false; };
            firstNightWindowOpen = true;
            DoBlurred(() => dlg.ShowDialog());
        }

        /// <summary>
        /// open editor for other nights order
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void OtherNights(object sender, ExecutedRoutedEventArgs e)
        {
            if (otherNightWindowOpen) { return; }
            var nightOrderWrapper = new NightOrderWrapper(DataContext as DocumentWrapper, false);
            NightOrder dlg = new NightOrder(nightOrderWrapper)
            {
                Owner = this,
                ShowActivated = true
            };
            dlg.Closed += (object _s, EventArgs _e) => { otherNightWindowOpen = false; };
            otherNightWindowOpen = true;
            DoBlurred(() => dlg.ShowDialog());
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
            (DataContext as DocumentWrapper).Logo = System.Drawing.Image.FromFile(path);
        }

        private string ChooseImage()
        {
            var dlg = new OpenFileDialog
            {
                Filter = "Images (*.jpg;*.png;*.bmp;*.gif)|*.jpg;*.png;*.bmp;*.gif"
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
                CharacterList.Focus();
            }
        }
        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            docWrapper.AddCharacter();
            CharacterList.SelectedIndex = docWrapper.CharacterList.Count - 1;
            CharacterList.Focus();
        }
        private void DelButton_Click(object sender, RoutedEventArgs e)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            var index = CharacterList.SelectedIndex;
            docWrapper.RemoveCharacter(index);
            FixCharacterListSelection(index);
        }

        private void FixCharacterListSelection(int preferred)
        {
            var docWrapper = (DataContext as DocumentWrapper);
            if (CharacterList.SelectedIndex == -1 && CharacterList.Items.Count != 0)
            {
                CharacterList.SelectedIndex = Math.Max(0, Math.Min(preferred, docWrapper.CharacterList.Count - 1));
                CharacterList.Focus();
            }
        }

        private void SourceImageButton_Click(object sender, RoutedEventArgs e)
        {
            var path = ChooseImage();
            if (path == null) { return; }
            var docWrapper = (DataContext as DocumentWrapper);
            var charWrapper = (CharacterList.SelectedItem as CharacterWrapper);
            charWrapper.SourceImage = System.Drawing.Image.FromFile(path);
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
    }
}
