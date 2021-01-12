using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for StringDialog.xaml
    /// </summary>
    public partial class StringDialog : Window
    {
        /// <summary>
        /// chosen string prefix or null, if cancelled
        /// </summary>
        public string Result { get; set; }

        public StringDialog(string title, string message, string defaultString)
        {
            InitializeComponent();
            Result = null;
            Title = title;
            TitleLabel.Text = title;
            Message.Text = message;
            TextField.Text = defaultString;
        }

        /// <summary>
        /// accept entered string
        /// </summary>
        private void Ok_Click(object sender, RoutedEventArgs e)
        {
            Result = TextField.Text;
            Close();
        }

        /// <summary>
        /// cancel setting the string
        /// </summary>
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Result = null;
            Close();
        }
    }
}
