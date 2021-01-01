using SixLabors.ImageSharp;
using System.IO;
using System.Windows.Forms;

namespace BloodstarClocktica
{
    public partial class TokenImageForm : Form
    {
        Image _SrcImage;
        public Image SrcImage
        {
            get { return _SrcImage; }
            set
            {
                _SrcImage = value;
                if (value == null)
                {
                    SourceImageButton.BackgroundImage = null;
                    SourceImageButton.Text = "Click to import source image";
                }
                else
                {
                    var ms = new MemoryStream();
                    _SrcImage.SaveAsPng(ms);
                    SourceImageButton.BackgroundImage = System.Drawing.Image.FromStream(ms);
                    SourceImageButton.Text = "";
                }
            }
        }
        Image _ProcessedImage;
        public Image ProcessedImage { get; }
        public TokenImageForm()
        {
            InitializeComponent();
        }
    }
}
