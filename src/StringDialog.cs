using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public partial class StringDialog : Form
    {
        public string Value { get; set; }
        public StringDialog(string title, string message, string defaultValue)
        {
            InitializeComponent();
            Label.Text = message;
            Text = title;
            Value = defaultValue;
            TextBox.Text = defaultValue;
        }

        private void TextBox_TextChanged(object sender, EventArgs e)
        {
            this.Value = (sender as TextBox).Text;
        }
    }
}
