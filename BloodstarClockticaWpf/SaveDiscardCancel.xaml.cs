using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace BloodstarClockticaWpf
{
    public enum SaveDiscardCancelResult
    {
        Save,
        Discard,
        Cancel
    }

    /// <summary>
    /// Interaction logic for SaveDiscardCancel.xaml
    /// </summary>
    public partial class SaveDiscardCancel : Window
    {
        public SaveDiscardCancelResult Result { get; set; }

        public SaveDiscardCancel()
        {
            InitializeComponent();
            Result = SaveDiscardCancelResult.Cancel;
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            Result = SaveDiscardCancelResult.Save;
            Close();
        }
        private void Discard_Click(object sender, RoutedEventArgs e)
        {
            Result = SaveDiscardCancelResult.Discard;
            Close();
        }
        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            Result = SaveDiscardCancelResult.Cancel;
            Close();
        }
        private void Close_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}
