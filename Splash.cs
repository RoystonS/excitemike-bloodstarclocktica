using System;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public partial class Splash : Form
    {
        Timer Timer;
        int Ticks;
        public event Action Done;
        static readonly int Fps = 30;
        static readonly int SplashTicks = 1 * Fps;

        public Splash(Action onDone)
        {
            InitializeComponent();
            this.Done += onDone;
            Opacity = 0;
        }

        private void Splash_Shown(object sender, EventArgs e)
        {
            Timer = new Timer();
            Ticks = 0;
            Timer.Interval = 1000 / Fps;
            Timer.Start();
            Timer.Tick += OnTick;
        }

        private void OnTick(object sender, EventArgs e)
        {
            if (Ticks <= SplashTicks)
            {
                double x = Ticks / (double)SplashTicks;
                // fast at invisible ends, slowing as it nears full opacity in the middle
                x = 4 * x * (1 - x);
                x *= 2 - x;
                x *= 2 - x;
                Opacity = x;
                Ticks += 1;
            }
            else
            {
                Timer.Stop();
                Done();
                Close();
            }
        }
    }
}
