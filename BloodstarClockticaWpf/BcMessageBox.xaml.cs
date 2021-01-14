using System.Windows;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for BcMessageBox.xaml
    /// </summary>
    public partial class BcMessageBox : Window
    {
        /// <summary>
        /// chosen string prefix or null, if cancelled
        /// </summary>
        public string Result { get; set; }


        private BcMessageBox(string title, string message) : this(title, message, Application.Current.MainWindow)
        {
        }

        private BcMessageBox(string title, string message, Window owner)
        {
            InitializeComponent();
            Result = null;
            Title = title;
            TitleLabel.Text = title;
            Message.Text = message;
            Owner = owner ?? Application.Current.MainWindow;
        }

        /// <summary>
        /// accept entered string
        /// </summary>
        private void Ok_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = true;
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

        /// <summary>
        /// show a message to the user
        /// </summary>
        /// <param name="title"></param>
        /// <param name="message"></param>
        /// <param name="owner"></param>
        public static void Show(string title, string message)
        {
            var dlg = new BcMessageBox(title, message);
            dlg.ShowDialog();
        }

        /// <summary>
        /// show a message to the user
        /// </summary>
        /// <param name="title"></param>
        /// <param name="message"></param>
        /// <param name="owner"></param>
        public static void Show(string title, string message, Window owner)
        {
            var dlg = new BcMessageBox(title, message, owner);
            dlg.ShowDialog();
        }
    }
}
