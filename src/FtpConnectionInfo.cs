using System.Net;
using System.Text;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public partial class FtpConnectionInfo : Form
    {
        private readonly bool initializing;
        public FtpConnectionInfo()
        {
            initializing = true;
            InitializeComponent();
            UrlRootTextBox.Text = BC.Document.Meta.UrlRoot;
            RemotePathTextBox.Text = BC.Document.Meta.SftpRemoteDirectory;
            HostTextBox.Text = BC.Document.Meta.SftpHost;
            PortControl.Value = BC.Document.Meta.SftpPort;
            UsernameTextBox.Text = BC.Document.Meta.SftpUser;
            RememberPasswordCheckBox.Checked = Properties.Settings.Default.RememberPassword;
            PasswordTextBox.Text = Decrypt(Properties.Settings.Default.SavedPassword);
            initializing = false;
        }

        /// <summary>
        /// url root changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void UrlRootTextBox_TextChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            if (UrlRootTextBox.Text != BC.Document.Meta.UrlRoot)
            {
                BC.Document.Meta.UrlRoot = UrlRootTextBox.Text;
                BC.SetDirty(true);
            }
        }

        /// <summary>
        /// host changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void HostTextBox_TextChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            if (HostTextBox.Text != BC.Document.Meta.SftpHost)
            {
                BC.Document.Meta.SftpHost = WebUtility.UrlEncode(UrlRootTextBox.Text);
                BC.SetDirty(true);
            }
        }

        /// <summary>
        /// port number changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PortControl_ValueChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            if (PortControl.Value != BC.Document.Meta.SftpPort)
            {
                BC.Document.Meta.SftpPort = (int)PortControl.Value;
                BC.SetDirty(true);
            }
        }

        /// <summary>
        /// username changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void UsernameTextBox_TextChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            if (UsernameTextBox.Text != BC.Document.Meta.SftpUser)
            {
                BC.Document.Meta.SftpUser = UsernameTextBox.Text;
                BC.SetDirty(true);
            }
        }

        /// <summary>
        /// password text changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PasswordTextBox_TextChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            if (RememberPasswordCheckBox.Checked)
            {
                Properties.Settings.Default.SavedPassword = Encrypt(PasswordTextBox.Text);
                Properties.Settings.Default.Save();
            }
        }

        /// <summary>
        /// "remember password" checkbox changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void RememberPasswordCheckBox_CheckedChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            Properties.Settings.Default.RememberPassword = RememberPasswordCheckBox.Checked;
            if (RememberPasswordCheckBox.Checked)
            {
                Properties.Settings.Default.SavedPassword = Encrypt(PasswordTextBox.Text);
            }
            else
            {
                Properties.Settings.Default.SavedPassword = Encrypt("");
            }
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// remote path changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void RemotePathTextBox_TextChanged(object sender, System.EventArgs e)
        {
            if (initializing) { return; }
            if (RemotePathTextBox.Text != BC.Document.Meta.SftpRemoteDirectory)
            {
                BC.Document.Meta.SftpRemoteDirectory = RemotePathTextBox.Text;
                BC.SetDirty(true);
            }
        }

        /// <summary>
        /// dead simple encryption just so we aren't storing passwords plain-text
        /// </summary>
        /// <param name="plainText"></param>
        /// <returns></returns>
        private string Encrypt(string plainText)
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
        /// dead simple encryption just so we aren't storing passwords plain-text
        /// </summary>
        /// <param name="plainText"></param>
        /// <returns></returns>
        private string Decrypt(string encrypted)
        {
            return Encrypt(encrypted);
        }
    }
}
