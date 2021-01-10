using System;
using System.Drawing;

namespace BloodstarClockticaLib
{
    public static class BcImage
    {
        public class ProcessImageSettings
        {
            public static int DropShadowSize = 16;
            public static int DropShadowOffsetX = 0;
            public static int DropShadowOffsetY = 10;
            public static double DropShadowOpacity = 0.5;
            public static int Margin = 10;
            public static int OutputWidth = 539;
            public static int OutputHeight = 539;
            public static Rectangle Position = new Rectangle(120, 50, 300, 300);
            public static Bitmap TownsfolkGradient = Properties.Resources.TownsfolkGradient;
            public static Bitmap OutsiderGradient = Properties.Resources.OutsiderGradient;
            public static Bitmap MinionGradient = Properties.Resources.MinionGradient;
            public static Bitmap DemonGradient = Properties.Resources.DemonGradient;
            public static Bitmap TravelerGradient = Properties.Resources.TravelerGradient;
            public static double BorderSize = 2;
        }

        /// <summary>
        /// create the character token image based on a shape and color
        /// </summary>
        /// <param name="source"></param>
        /// <param name="colorGradient"></param>
        /// <returns>processed copy of the image</returns>
        public static Image ProcessImage(Image source, Bitmap colorGradient)
        {
            var trimmed = new Bitmap(source).Trim();
            var colored = trimmed.SetRGB(255, 255, 255).Multiply(colorGradient.Resized(trimmed.Width, trimmed.Height));
            return new Bitmap(ProcessImageSettings.OutputWidth, ProcessImageSettings.OutputHeight)
                .PasteZoomed(colored, ProcessImageSettings.Position)
                .Multiply(Properties.Resources.Texture)
                .AddBorder(ProcessImageSettings.BorderSize)
                .AddDropShadow(ProcessImageSettings.DropShadowSize, ProcessImageSettings.DropShadowOffsetX, ProcessImageSettings.DropShadowOffsetY, ProcessImageSettings.DropShadowOpacity);
        }

        /// <summary>
        /// Get a color for the character's team
        /// </summary>
        /// <param name="team"></param>
        /// <returns></returns>
        public static Bitmap GetGradientForTeam(BcTeam.TeamValue team)
        {
            switch (team)
            {
                case BcTeam.TeamValue.Townsfolk:
                    return ProcessImageSettings.TownsfolkGradient;
                case BcTeam.TeamValue.Outsider:
                    return ProcessImageSettings.OutsiderGradient;
                case BcTeam.TeamValue.Minion:
                    return ProcessImageSettings.MinionGradient;
                case BcTeam.TeamValue.Demon:
                    return ProcessImageSettings.DemonGradient;
                case BcTeam.TeamValue.Traveler:
                default:
                    return ProcessImageSettings.TravelerGradient;
            }
            throw new System.Exception("Unhandled team in GetGradientForTeam");
        }
    }
}
