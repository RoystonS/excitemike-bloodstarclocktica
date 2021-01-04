using System;
using System.Drawing;

namespace BloodstarClocktica
{
    internal static partial class BC
    {
        static class ProcessImageSettings
        {
            internal static int DropShadowSize = 16;
            internal static int DropShadowOffsetX = 0;
            internal static int DropShadowOffsetY = 10;
            internal static double DropShadowOpacity = 0.5;
            internal static int Margin = 10;
            internal static int OutputWidth = 539;
            internal static int OutputHeight = 539;
            internal static Rectangle Position = new Rectangle(120, 50, 300, 300);
            internal static Bitmap TownsfolkGradient = Properties.Resources.TownsfolkGradient;
            internal static Bitmap OutsiderGradient = Properties.Resources.OutsiderGradient;
            internal static Bitmap MinionGradient = Properties.Resources.MinionGradient;
            internal static Bitmap DemonGradient = Properties.Resources.DemonGradient;
            internal static Bitmap TravelerGradient = Properties.Resources.TravelerGradient;
            internal static double BorderSize = 2;
        }

        /// <summary>
        /// create the character token image based on a shape and color
        /// </summary>
        /// <param name="source"></param>
        /// <param name="colorGradient"></param>
        /// <returns>processed copy of the image</returns>
        internal static Image ProcessImage(Image source, Bitmap colorGradient)
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
        internal static Bitmap GetGradientForTeam(SaveTeam.TeamValue team)
        {
            // TODO: should be a gradient
            // TODO: should come from settings
            switch (team)
            {
                case SaveTeam.TeamValue.Townsfolk:
                    return ProcessImageSettings.TownsfolkGradient;
                case SaveTeam.TeamValue.Outsider:
                    return ProcessImageSettings.OutsiderGradient;
                case SaveTeam.TeamValue.Minion:
                    return ProcessImageSettings.MinionGradient;
                case SaveTeam.TeamValue.Demon:
                    return ProcessImageSettings.DemonGradient;
                case SaveTeam.TeamValue.Traveler:
                default:
                    return ProcessImageSettings.TravelerGradient;
            }
            throw new System.Exception("Unhandled team in GetColorForTeam");
        }
    }
}
