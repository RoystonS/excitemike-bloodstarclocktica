using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading.Tasks;

namespace BloodstarClocktica
{
    internal static class BitmapExtensionMethods
    {
        static readonly Random _GlobalRand = new Random();
        [ThreadStatic]
        static Random _ThreadRand;
        static double NextRand()
        {
            if (_ThreadRand == null)
            {
                _ThreadRand = new Random(_GlobalRand.Next());
            }
            return _ThreadRand.NextDouble();
        }

        /// <summary>
        /// resize, adding extra spacing to keep the aspect ratio the same
        /// </summary>
        /// <param name="source"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <returns>a new bitmap</returns>
        internal static Bitmap Fit(this Bitmap source, int width, int height)
        {
            return new Bitmap(width, height).PasteZoomed(source, new Rectangle(0, 0, width, height));
        }

        /// <summary>
        /// paste the source bitmap, scaled without changing the aspect ratio, into the rect in the destination bitmap
        /// </summary>
        /// <param name="destination"></param>
        /// <param name="source"></param>
        /// <param name="rect"></param>
        /// <returns>destination image</returns>
        internal static Bitmap PasteZoomed(this Bitmap destination, Bitmap source, Rectangle rect)
        {
            if (source.Width == 0 || source.Height == 0 || rect.Width == 0 || rect.Height == 0) { return destination; }
            var sourceAspect = (double)source.Width / source.Height;
            var destinationAspect = (double)rect.Width / rect.Height;
            if (sourceAspect > destinationAspect)
            {
                var newH = (int)(rect.Width / sourceAspect);
                var extraSpace = rect.Height - newH;
                rect.Y += extraSpace / 2;
                rect.Height -= extraSpace;
            }
            else
            {
                var newW = (int)(rect.Height * sourceAspect);
                var extraSpace = rect.Width - newW;
                rect.X += extraSpace / 2;
                rect.Width -= extraSpace;
            }
            using (Graphics g = Graphics.FromImage(destination))
            {
                g.DrawImage(source, rect);
            }
            return destination;
        }

        /// <summary>
        /// Create a resized copy of the image
        /// </summary>
        /// <param name="im"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <returns>resized copy of image</returns>
        internal static Bitmap Resized(this Bitmap im, int width, int height)
        {
            var output = new Bitmap(width, height);
            using (Graphics g = Graphics.FromImage(output))
            {
                g.DrawImage(im, new Rectangle(0, 0, width, height));
            }
            return output;
        }
        /// <summary>
        /// create a new, scaled copy of the image
        /// </summary>
        /// <param name="destination"></param>
        /// <param name="source"></param>
        /// <param name="rect"></param>
        /// <returns>new image</returns>
        internal static Bitmap Scale(this Bitmap source, double factor)
        {
            var destination = new Bitmap((int)(source.Width * factor), (int)(source.Height * factor));
            using (Graphics g = Graphics.FromImage(destination))
            {
                g.DrawImage(source, new Rectangle(0,0,destination.Width, destination.Height));
            }
            return destination;
        }

        /// <summary>
        /// create a copy of the image cropped to visible pixels
        /// </summary>
        /// <param name="im"></param>
        /// <returns>cropped copy of the image</returns>
        internal static Bitmap Trim(this Bitmap im)
        {
            return im.Crop(im.GetBBox());
        }

        /// <summary>
        /// crop image
        /// </summary>
        /// <param name="im"></param>
        /// <param name="rect"></param>
        /// <returns>cropped copy of the imageimage</returns>
        internal static Bitmap Crop(this Image im, Rectangle rect)
        {
            var cropped = new Bitmap(rect.Width, rect.Height);
            using (Graphics g = Graphics.FromImage(cropped))
            {
                g.DrawImage(im, new Rectangle(0, 0, rect.Width, rect.Height), rect.X, rect.Y, rect.Width, rect.Height, GraphicsUnit.Pixel);
            }
            return cropped;
        }

        /// <summary>
        /// wraps Bitmap.LockBits/.UnlockBits used to make sure it unlocked even if there's an exception or something
        /// </summary>
        class BitmapLock : IDisposable
        {
            private Bitmap bitmap;
            private BitmapData data;
            public BitmapData Data
            {
                get
                {
                    return data;
                }
            }
            public BitmapLock(Bitmap bitmap, ImageLockMode lockMode)
            {
                this.bitmap = bitmap;
                this.data = bitmap.LockBits(new Rectangle(0, 0, bitmap.Width, bitmap.Height), lockMode, PixelFormat.Format32bppArgb);
            }
             ~BitmapLock()
             {
                 Dispose();
             }

            public void Dispose()
            {
                if (data != null)
                {
                    bitmap.UnlockBits(data);
                    data = null;
                    bitmap = null;
                }
                GC.SuppressFinalize(this);
            }
        }

        /// <summary>
        /// find the region in the bitmap with non-transparent pixels
        /// </summary>
        /// <param name="bitmap"></param>
        /// <returns>rectangle representing that region</returns>
        internal static Rectangle GetBBox(this Bitmap bitmap)
        {
            int left = bitmap.Width;
            int top = bitmap.Height;
            int right = 0;
            int bottom = 0;

            using (var locked = new BitmapLock(bitmap, ImageLockMode.ReadOnly))
            {
                var data = locked.Data;
                int bytesPerPixel = Image.GetPixelFormatSize(bitmap.PixelFormat) / 8;
                unsafe
                {
                    byte* firstPixel = (byte*)locked.Data.Scan0;

                    for (int y = 0; y < data.Height; ++y)
                    {
                        byte* currentLine = firstPixel + (y * data.Stride);
                        for (int x = 0; x < data.Width; ++x)
                        {
                            int i = x * bytesPerPixel;
                            int b = currentLine[i];
                            int g = currentLine[i + 1];
                            int r = currentLine[i + 2];
                            int a = currentLine[i + 3];
                            if (a > 0)
                            {
                                left = Math.Min(left, x);
                                top = Math.Min(top, y);
                                right = Math.Max(right, x);
                                bottom = Math.Max(bottom, y);
                            }
                        }
                    };
                }
            }

            if (right <= left)
            {
                left = top = right = bottom = 0;
            }
            return new Rectangle(left, top, right - left, bottom - top);
        }

        /// <summary>
        /// replace the red green and blue channels with a solid color (in-place)
        /// </summary>
        /// <param name="im"></param>
        /// <param name="red"></param>
        /// <param name="green"></param>
        /// <param name="blue"></param>
        /// <returns>the in-place modified bitmap</returns>
        internal static Bitmap SetRGB(this Bitmap im, byte red, byte green, byte blue)
        {
            using (var locked = new BitmapLock(im, ImageLockMode.WriteOnly))
            {
                var data = locked.Data;
                unsafe
                {
                    int bytesPerPixel = Image.GetPixelFormatSize(data.PixelFormat) / 8;
                    byte* firstPixel = (byte*)locked.Data.Scan0;

                    Parallel.For(0, data.Height, y =>
                    {
                        byte* currentLine = firstPixel + (y * data.Stride);
                        for (int x = 0; x < data.Width; ++x)
                        {
                            int i = x * bytesPerPixel;
                            currentLine[i] = blue;
                            currentLine[i + 1] = green;
                            currentLine[i + 2] = red;
                        }
                    });
                }
            }
            return im;
        }

        /// <summary>
        /// create a new image based on source that has pixels visible only where it is on a detected edge
        /// </summary>
        /// <param name="source"></param>
        /// <returns>new image</returns>
        internal static Bitmap EdgeDetect(this Bitmap source)
        {
            Bitmap destination = new Bitmap(source.Width, source.Height);
            using (var dstLock = new BitmapLock(destination, ImageLockMode.WriteOnly))
            {
                var dstData = dstLock.Data;
                using (var srcLock = new BitmapLock(source, ImageLockMode.ReadOnly))
                {
                    var srcData = srcLock.Data;
                    int bytesPerPixel = Image.GetPixelFormatSize(srcData.PixelFormat) / 8;
                    unsafe
                    {
                        byte* dstPixels = (byte*)dstData.Scan0;
                        byte* srcPixels = (byte*)srcData.Scan0;

                        byte GetAlpha(int x, int y) => srcPixels[(y * srcData.Stride) + (x * bytesPerPixel) + 3];
                        void SetPixel(int x, int y, bool onEdge)
                        {
                            var pixel = dstPixels + (y * srcData.Stride) + (x * bytesPerPixel);
                            pixel[0] = 255;
                            pixel[1] = 255;
                            pixel[2] = 255;
                            pixel[3] = onEdge ? (byte)255 : (byte)0;
                        }

                        Parallel.For(0, dstData.Height, y =>
                        {
                            for (int x = 0; x < dstData.Width; ++x)
                            {
                                var thisPixel = GetAlpha(x, y);
                                for (var y2 = Math.Max(0, y - 1); y2 < Math.Min(srcData.Height, y + 2); y2++)
                                {
                                    for (var x2 = Math.Max(0, x - 1); x2 < Math.Min(srcData.Width, x + 2); x2++)
                                    {
                                        if ((thisPixel > 127) != (GetAlpha(x2, y2) > 127))
                                        {
                                            SetPixel(x, y, true);
                                            goto NextPixel;
                                        }
                                    }
                                }
                                SetPixel(x, y, false);
                            NextPixel:
                                continue;
                            }
                        });
                    }
                }
            }
            return destination;
        }

        /// <summary>
        /// create a new image that is the result of blurring the image
        /// </summary>
        /// <param name="source"></param>
        /// <param name="radius"></param>
        /// <returns>new image containing result of blur</returns>
        internal static Bitmap GaussianBlur(this Bitmap source, double radius)
        {
            return source.Convolve(GaussianKernel(radius));
        }

        /// <summary>
        /// create a new image that is the result of blurring one channel of the image
        /// </summary>
        /// <param name="source"></param>
        /// <param name="radius"></param>
        /// <returns>new image containing result of blur</returns>
        internal static Bitmap GaussianBlurChannel(this Bitmap source, int channel, double radius)
        {
            return source.ConvolveChannel(channel, GaussianKernel(radius));
        }

        /// <summary>
        /// create a new image that is the result of applying a convolution matrix to the image
        /// </summary>
        /// <param name="source"></param>
        /// <param name="matrix"></param>
        /// <returns>new image containing convolve result</returns>
        internal static Bitmap Convolve(this Bitmap source, double[,] matrix)
        {
            if ((matrix.GetLength(0) % 2 == 0)|| (matrix.GetLength(1) % 2 == 0)) { throw new BcImageProcessingException("Convolve expects the dimensions to be odd"); }
            var xReach = matrix.GetLength(0) / 2;
            var yReach = matrix.GetLength(1) / 2;
            Bitmap destination = new Bitmap(source.Width, source.Height);

            using (var dstLock = new BitmapLock(destination, ImageLockMode.WriteOnly))
            {
                var dstData = dstLock.Data;
                int bytesPerPixel = Image.GetPixelFormatSize(dstData.PixelFormat) / 8;
                using (var srcLock = new BitmapLock(source, ImageLockMode.ReadOnly))
                {
                    var srcData = srcLock.Data;
                    unsafe
                    {
                        byte* dstPixels = (byte*)dstData.Scan0;
                        byte* srcPixels = (byte*)srcData.Scan0;
                        Parallel.For(0, dstData.Height, dstY =>
                        {
                            for (int dstX = 0; dstX < dstData.Width; ++dstX)
                            {
                                double blue = 0;
                                double green = 0;
                                double red = 0;
                                double alpha = 0;
                                double weightSum = 0;

                                for (var srcY = Math.Max(0, dstY - yReach); srcY < Math.Min(srcData.Height, dstY + yReach + 1); srcY++)
                                {
                                    for (var srcX = Math.Max(0, dstX - xReach); srcX < Math.Min(srcData.Width, dstX + xReach + 1); srcX++)
                                    {
                                        var weight = matrix[srcY - (dstY - yReach), srcX - (dstX - xReach)];
                                        weightSum += weight;
                                        var pixelStart = srcPixels + (srcY * srcData.Stride) + (srcX * bytesPerPixel);
                                        blue += weight * pixelStart[0];
                                        green += weight * pixelStart[1];
                                        red += weight * pixelStart[2];
                                        alpha += weight * pixelStart[3];
                                    }
                                }

                                dstPixels[(dstY * srcData.Stride) + (dstX * bytesPerPixel) + 0] = (byte)Math.Max(0, Math.Min(255.5, blue / weightSum));
                                dstPixels[(dstY * srcData.Stride) + (dstX * bytesPerPixel) + 1] = (byte)Math.Max(0, Math.Min(255.5, green / weightSum));
                                dstPixels[(dstY * srcData.Stride) + (dstX * bytesPerPixel) + 2] = (byte)Math.Max(0, Math.Min(255.5, red / weightSum));
                                dstPixels[(dstY * srcData.Stride) + (dstX * bytesPerPixel) + 3] = (byte)Math.Max(0, Math.Min(255.5, alpha / weightSum));
                            }
                        });
                    }
                }
            }
            return destination;
        }

        /// <summary>
        /// create a new image that is the result of applying a convolution matrix to one channel of the image
        /// </summary>
        /// <param name="source"></param>
        /// <param name="matrix"></param>
        /// <returns>new image containing convolve result</returns>
        internal static Bitmap ConvolveChannel(this Bitmap source, int channel, double[,] matrix)
        {
            if ((matrix.GetLength(0) % 2 == 0) || (matrix.GetLength(1) % 2 == 0)) { throw new BcImageProcessingException("Convolve expects the dimensions to be odd"); }
            var xReach = matrix.GetLength(0) / 2;
            var yReach = matrix.GetLength(1) / 2;
            Bitmap destination = new Bitmap(source.Width, source.Height);

            using (var dstLock = new BitmapLock(destination, ImageLockMode.WriteOnly))
            {
                BitmapData dstData = dstLock.Data;
                int bytesPerPixel = Image.GetPixelFormatSize(dstData.PixelFormat) / 8;
                using (var srcLock = new BitmapLock(source, ImageLockMode.ReadOnly))
                {
                    BitmapData srcData = srcLock.Data;
                    unsafe
                    {
                        byte* dstPixels = (byte*)dstData.Scan0;
                        byte* srcPixels = (byte*)srcData.Scan0;

                        Parallel.For(0, dstData.Height, dstY =>
                        {
                            for (int dstX = 0; dstX < dstData.Width; ++dstX)
                            {
                                double value = 0;
                                double weightSum = 0;

                                for (var srcY = Math.Max(0, dstY - yReach); srcY < Math.Min(srcData.Height, dstY + yReach + 1); srcY++)
                                {
                                    for (var srcX = Math.Max(0, dstX - xReach); srcX < Math.Min(srcData.Width, dstX + xReach + 1); srcX++)
                                    {
                                        var weight = matrix[srcY - (dstY - yReach), srcX - (dstX - xReach)];
                                        weightSum += weight;
                                        var pixelStart = srcPixels + (srcY * srcData.Stride) + (srcX * bytesPerPixel);
                                        value += weight * pixelStart[channel];
                                    }
                                }

                                for (int outChannel = 0; outChannel < 4; outChannel++)
                                {
                                    var i = (dstY * srcData.Stride) + (dstX * bytesPerPixel) + outChannel;
                                    if (outChannel == channel)
                                    {
                                        dstPixels[i] = (byte)Math.Max(0, Math.Min(255.5, value / weightSum));
                                    }
                                    else
                                    {
                                        dstPixels[i] = srcPixels[i];
                                    }
                                }
                            }
                        });
                    }
                }
            }
            return destination;
        }

        /// <summary>
        /// Alpha composite im2 over im1 (in-place)
        /// </summary>
        /// <param name="bottom"></param>
        /// <param name="top"></param>
        /// <returns>im1</returns>
        internal static Bitmap AlphaComposite(this Bitmap im1, Bitmap im2)
        {
            using (Graphics g = Graphics.FromImage(im1))
            {
                g.DrawImage(im2, 0, 0);
            }
            return im1;
        }

        /// <summary>
        /// create a new bitmap by offsetting the pixels in this one
        /// </summary>
        /// <param name="im"></param>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <returns>a new bitmap</returns>
        internal static Bitmap Offset(this Bitmap source, int x, int y)
        {
            var destination = new Bitmap(source.Width, source.Height);
            using (Graphics g = Graphics.FromImage(destination))
            {
                g.DrawImage(source, x, y);
            }
            return destination;
        }

        /// <summary>
        /// make a new dropshadow image based on the input image
        /// </summary>
        /// <param name="im"></param>
        /// <returns>copy of original image with dropshadow applied</returns>
        internal static Bitmap AddDropShadow(this Bitmap im, double size, int x, int y, double opacity)
        {
            return new Bitmap(im.Width, im.Height)
                .AlphaComposite(im)
                .SetRGB(0, 0, 0)
                .Scale(0.25)
                .GaussianBlur(size / 4.0)
                .Scale(4)
                .Offset(x, y)
                .TransformChannel(3, alpha => (byte)Math.Max(0, Math.Min(255, opacity * alpha)))
                .AlphaComposite(im);
        }

        /// <summary>
        /// edit pixels of a channel in-place
        /// </summary>
        /// <param name="im"></param>
        /// <param name="channel"></param>
        /// <param name="func"></param>
        /// <returns>in-place modified original image</returns>
        internal static Bitmap TransformChannel(this Bitmap im, int channel, Func<byte, byte> func)
        {
            using (var imLock = new BitmapLock(im, ImageLockMode.ReadWrite))
            {
                BitmapData data = imLock.Data;
                int bytesPerPixel = Image.GetPixelFormatSize(data.PixelFormat) / 8;
                unsafe
                {
                    byte* pixels = (byte*)data.Scan0;
                    Parallel.For(0, data.Height, dstY =>
                    {
                        for (int dstX = 0; dstX < data.Width; ++dstX)
                        {
                            var pixel = pixels + (dstY * data.Stride) + (dstX * bytesPerPixel) + channel;
                            *pixel = func(*pixel);
                        }
                    });
                }
            }
            return im;
        }

        /// <summary>
        /// Transform image in place, adding gaussian noise to a channel
        /// </summary>
        /// <param name="im"></param>
        /// <param name="channel"></param>
        /// <param name="sigma">std deviation</param>
        /// <returns>in-place modified original image</returns>
        internal static Bitmap AddNoiseToChannel(this Bitmap im, int channel, double sigma)
        {
            return im.TransformChannel(channel, mean => {
                var r = NextRand();
                while (r < 1E-100)
                {
                    r = NextRand();
                }
                var z = mean + sigma * Math.Sqrt(-2.0 * Math.Log(r)) * Math.Cos(2.0 * Math.PI * NextRand());
                return (byte)Math.Max(0, Math.Min(255.5, z));
            });
        }

        /// <summary>
        /// multiply blend other over im (edits im in-place)
        /// </summary>
        /// <param name="im"></param>
        /// <param name="other"></param>
        /// <returns>in-place modified original image</returns>
        internal static Bitmap Multiply(this Bitmap im, Bitmap other)
        {
            using (var imLock = new BitmapLock(im, ImageLockMode.ReadWrite))
            {
                BitmapData imData = imLock.Data;
                int bytesPerPixel = Image.GetPixelFormatSize(imData.PixelFormat) / 8;
                using (var multLock = new BitmapLock(other, ImageLockMode.ReadOnly))
                {
                    BitmapData multData = multLock.Data;
                    unsafe
                    {
                        byte* imPixels = (byte*)imData.Scan0;
                        byte* multPixels = (byte*)multData.Scan0;
                        Parallel.For(0, Math.Min(imData.Height, multData.Height), dstY =>
                        {
                            for (int dstX = 0; dstX < Math.Min(imData.Width, multData.Width); ++dstX)
                            {
                                double multAlpha = multPixels[(dstY * multData.Stride) + (dstX * bytesPerPixel) + 3] / 255.0;
                                for (int channel = 0; channel < 3; ++channel)
                                {
                                    byte* dstByte = imPixels + (dstY * imData.Stride) + (dstX * bytesPerPixel) + channel;
                                    double oldVal = *dstByte;
                                    double multVal = multPixels[(dstY * multData.Stride) + (dstX * bytesPerPixel) + channel];
                                    multVal = oldVal * multVal / 255.0;
                                    *dstByte = (byte)Math.Max(0, Math.Min(255, multVal));
                                    *dstByte = (byte)Math.Max(0, Math.Min(255, oldVal + multAlpha * (multVal - oldVal)));
                                }
                            }
                        });
                    }
                }
            }
            return im;
        }

        /// <summary>
        /// Add a border to the image
        /// </summary>
        /// <param name="im"></param>
        /// <returns>image modified in-place</returns>
        internal static Bitmap AddBorder(this Bitmap im, double size)
        {
            var overlay = im
                .EdgeDetect()
                .GaussianBlurChannel(3, size)
                .TransformChannel(3, alpha => { return (byte)Math.Min(255, alpha * size); });
            return im.AlphaComposite(overlay);
        }

        /// <summary>
        /// Gaussian function
        /// </summary>
        /// <param name="x"></param>
        /// <param name="mu"></param>
        /// <param name="sigma"></param>
        /// <returns></returns>
        static double Gaussian(double x, double mu, double sigma)
        {
            var a = (x - mu) / sigma;
            return Math.Exp(-0.5 * a * a);
        }

        /// <summary>
        /// create a convolution matrix for a Gaussian blur
        /// </summary>
        /// <param name="radius"></param>
        /// <returns>2d convolution matrix weights</returns>
        static double[,] GaussianKernel(double radius)
        {
            double sigma = radius / 2;
            int size = 2 * (int)Math.Ceiling(radius) + 1;
            double[,] result = new double[size,size];
            double sum = 0.0;
            for (int y=0; y<size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    var a = Gaussian(x, radius, sigma) * Gaussian(y, radius, sigma);
                    result[y,x] = a;
                    sum += a;
                }
            }
            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    result[y,x] /= sum;
                }
            }
            return result;
        }
    }
}
