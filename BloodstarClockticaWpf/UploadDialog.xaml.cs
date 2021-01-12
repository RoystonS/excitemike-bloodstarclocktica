using System;
using System.Text;
using System.Windows;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for UploadDialog.xaml
    /// </summary>
    public partial class UploadDialog : Window
    {
        private DocumentWrapper DocumentWrapper { get; set; }
        internal UploadDialog(DocumentWrapper docWrapper)
        {
            InitializeComponent();
            DocumentWrapper = docWrapper;

            var urlRoot = docWrapper.UrlRoot;
            if ("" == urlRoot)
            {
                urlRoot = $"https://meyermik.startlogic.com/botc/{docWrapper.Name}";
            }
            UrlRootTextField.Text = urlRoot;

            RemotePathTextField.Text = docWrapper.SftpRemoteDirectory;
            HostTextField.Text = docWrapper.SftpHost;
            PortControl.Value = docWrapper.SftpPort;
            UsernameTextField.Text = docWrapper.SftpUsername;
            PasswordTextField.Password = Decrypt(Properties.Settings.Default.SavedPassword);
            RememberPasswordCheckBox.IsChecked = Properties.Settings.Default.RememberPassword;
        }

        /// <summary>
        /// accept entered string
        /// </summary>
        private void Export_Click(object sender, RoutedEventArgs e)
        {
            throw new NotImplementedException();
            Close();
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
    }
}
