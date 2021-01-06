using System;
using System.Diagnostics;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public partial class LinkMessageBox : Form
    {
        public LinkMessageBox(string title, string message, string linkText)
        {
            InitializeComponent();
            Text = title;
            Label.Text = message;
            LinkLabel.Text = linkText;
        }

        private void CopyToClipboard_Click(object sender, System.EventArgs e)
        {
            Clipboard.SetText(LinkLabel.Text);
        }

        private void LinkLabel_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            if (Uri.IsWellFormedUriString(LinkLabel.Text, UriKind.Absolute))
            {
                Process.Start(LinkLabel.Text);
            }
        }
    }
}
