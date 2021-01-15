using System.Windows;

namespace BloodstarClockticaWpf
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        private void Application_Startup(object sender, StartupEventArgs e)
        {
#if DEBUG
            DispatcherUnhandledException -= Application_DispatcherUnhandledException;
#endif
            MainWindow mainWindow;
            if (e.Args.Length == 1)
            {
                mainWindow = new MainWindow();
                mainWindow.OpenNoPrompts(e.Args[0]);
            }
            else
            {
                mainWindow = new MainWindow();
            }
            mainWindow.Show();
        }

        private void Application_DispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
        {
            BcMessageBox.Show("Unhandled Exception", $"{e.Exception.Message}\n\n{e.Exception}", this.MainWindow);
            e.Handled = true;
        }
    }
}
