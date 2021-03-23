using System;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for UploadDialog.xaml
    /// </summary>
    public partial class UploadDialog : Window
    {
        private bool closable;
        private DocumentWrapper DocumentWrapper { get; set; }
        internal UploadDialog(DocumentWrapper docWrapper)
        {
            closable = true;
            InitializeComponent();
            DocumentWrapper = docWrapper;

            InitSettingsView();
            InitProgressBar();
            InitResults();
        }

        /// <summary>
        /// set up the settings view
        /// </summary>
        private void InitSettingsView()
        {
            var urlRoot = DocumentWrapper.UrlRoot;
            if (string.IsNullOrEmpty(urlRoot))
            {
                urlRoot = $"https://www.meyermike.com/botc/{DocumentWrapper.Name}";
            }
            UrlRootTextField.Text = urlRoot;

            RemotePathTextField.Text = DocumentWrapper.SftpRemoteDirectory;
            HostTextField.Text = DocumentWrapper.SftpHost;
            PortTextField.Text = DocumentWrapper.SftpPort.ToString();
            UsernameTextField.Text = DocumentWrapper.SftpUsername;
            PasswordTextField.Password = Decrypt(Properties.Settings.Default.SavedPassword);
            RememberPasswordCheckBox.IsChecked = Properties.Settings.Default.RememberPassword;
            SkipUnchanged.IsChecked = DocumentWrapper.SkipUnchanged;
            ExportButton.IsDefault = true;
        }

        /// <summary>
        /// set up the progressbar view
        /// </summary>
        private void InitProgressBar()
        {
            ProgressBar.Value = 0;
            ProgressBar.Visibility = Visibility.Collapsed;
        }

        /// <summary>
        /// set up the results view
        /// </summary>
        private void InitResults()
        {
            ResultsView.Visibility = Visibility.Collapsed;
        }

        /// <summary>
        /// accept entered string
        /// </summary>
        private async void Export_Click(object _sender, RoutedEventArgs _e)
        {
            SaveSettings();
            GoToProgressView();
            closable = false;
            // do export
            var progress = new Progress<double>(fraction => ProgressBar.Value = fraction);
            try
            {
                await DocumentWrapper.ExportToSftp(PasswordTextField.Password, progress);
            }
            catch (Exception e)
            {
                BcMessageBox.Show("Error uploading", $"Error uploading via SFTP.\n\n{e}", this);
                closable = true;
                Close();
            }
            finally
            {
                closable = true;
            }
            GoToResultView();
        }

        /// <summary>
        /// mess with visibilities to go to the progressbar view
        /// </summary>
        private void GoToProgressView()
        {
            ExportButton.IsDefault = false;
            CloseButton.Visibility = Visibility.Hidden;
            ResultsView.Visibility = Visibility.Collapsed;
            SettingsView.Visibility = Visibility.Collapsed;
            ProgressBar.Value = 0;
            ProgressBar.Visibility = Visibility.Visible;
        }

        /// <summary>
        /// mess with visibilities to go to the results view
        /// </summary>
        private void GoToResultView()
        {
            OkButton.IsDefault = true;
            Title = "Upload Complete!";
            LinkTextBox.Text = $"{DocumentWrapper.RolesUrl}";
            CloseButton.Visibility = Visibility.Visible;
            ProgressBar.Visibility = Visibility.Collapsed;
            ResultsView.Visibility = Visibility.Visible;
        }

        /// <summary>
        /// write choices to document and application settings
        /// </summary>
        private void SaveSettings()
        {
            DocumentWrapper.UrlRoot = UrlRootTextField.Text;
            DocumentWrapper.SftpRemoteDirectory = RemotePathTextField.Text;
            DocumentWrapper.SftpPort = int.TryParse(PortTextField.Text, out int port) ? port : 22;
            DocumentWrapper.SftpUsername = UsernameTextField.Text;
            DocumentWrapper.SkipUnchanged = SkipUnchanged.IsChecked ?? false;

            Properties.Settings.Default.RememberPassword = true == RememberPasswordCheckBox.IsChecked;
            Properties.Settings.Default.Save();
            if (true == RememberPasswordCheckBox.IsChecked)
            {
                Properties.Settings.Default.SavedPassword = Encrypt(PasswordTextField.Password);
            }
            else
            {
                Properties.Settings.Default.SavedPassword = Encrypt("");
            }
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// cancel setting the string
        /// </summary>
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        /// <summary>
        /// not really worthy of the name "encryption" but it's a notch better than storing passwords in plain-text
        /// </summary>
        /// <param name="plainText"></param>
        /// <returns></returns>
        private static string Encrypt(string plainText)
        {
            char key = (char)43;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < plainText.Length; ++i)
            {
                sb.Append((char)(plainText[i] ^ key));
            }
            return sb.ToString();
        }

        /// <summary>
        /// not really worthy of the name "encryption" but it's a notch better than storing passwords in plain-text
        /// </summary>
        /// <param name="encoded"></param>
        /// <returns></returns>
        private static string Decrypt(string encoded)
        {
            return Encrypt(encoded);
        }

        /// <summary>
        /// open link on double click
        /// </summary>
        private void LinkTextBox_MouseDoubleClick(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            Process.Start(LinkTextBox.Text);
        }

        /// <summary>
        /// copy roles.json link to clipboard
        /// </summary>
        private void CopyToClipboard(object sender, RoutedEventArgs e)
        {
            Clipboard.SetText(LinkTextBox.Text);
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (!closable)
            {
                e.Cancel = true;
            }
        }

        /// <summary>
        /// allow only numbers in the Port field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PortTextField_PreviewTextInput(object sender, System.Windows.Input.TextCompositionEventArgs e)
        {
            if ((e.Text == null) || (!e.Text.All(char.IsDigit)))
            {
                e.Handled = true;
            }
        }

        /// <summary>
        /// allow only numbers in the Port field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PortTextField_Pasting(object sender, DataObjectPastingEventArgs e)
        {
            if (e.DataObject.GetDataPresent(typeof(string)))
            {
                string text = (string)e.DataObject.GetData(typeof(string));
                if ((text == null) || (!text.All(char.IsDigit)))
                {
                    e.CancelCommand();
                }
            }
            else
            {
                e.CancelCommand();
            }
        }

        /// <summary>
        /// allow only numbers in the Port field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PortTextField_TextChanged(object sender, TextChangedEventArgs e)
        {
            TextBox textBox = sender as TextBox;
            int selectionStart = textBox.SelectionStart;
            int selectionLength = textBox.SelectionLength;

            string newText = string.Empty;
            var i = 0;
            foreach (char c in textBox.Text.ToCharArray())
            {
                if (char.IsDigit(c))
                {
                    newText += c;
                }
                else
                {
                    if (i < selectionStart)
                    {
                        selectionStart--;
                    }
                    else if (i < selectionStart + selectionLength)
                    {
                        selectionLength--;
                    }
                }
                i++;
            }

            if (newText != textBox.Text)
            {
                textBox.Text = newText;
                textBox.SelectionStart = selectionStart;
                textBox.SelectionLength = selectionLength;
            }
        }
    }
}
