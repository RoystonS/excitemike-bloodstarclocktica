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
            MessageBox.Show($"{e.Exception.Message}\n{e.Exception.StackTrace}");
            e.Handled = true;
        }
    }
}
