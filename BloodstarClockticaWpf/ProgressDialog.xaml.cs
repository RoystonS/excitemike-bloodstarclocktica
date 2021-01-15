using System.Windows;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for ProgressDialog.xaml
    /// </summary>
    public partial class ProgressDialog : Window
    {
        /// <summary>
        /// passthrough to the progress bar
        /// </summary>
        public double Value
        {
            get => ProgressBar.Value;
            set => ProgressBar.Value = value;
        }

        internal ProgressDialog()
        {
            InitializeComponent();
        }
    }
}
