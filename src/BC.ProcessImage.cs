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
            internal static (byte, byte, byte) TownsfolkColor = (31, 101, 241);
            internal static (byte, byte, byte) OutsiderColor = (61, 185, 255);
            internal static (byte, byte, byte) MinionColor = (252, 105, 0);
            internal static (byte, byte, byte) DemonColor = (206, 1, 0);
            internal static (byte, byte, byte) TravelerColor = (255, 255, 255);
            internal static double BorderSize = 2;
        }

        /// <summary>
        /// create the character token image based on a shape and color
        /// </summary>
        /// <param name="source"></param>
        /// <param name="red"></param>
        /// <param name="green"></param>
        /// <param name="blue"></param>
        /// <returns></returns>
        internal static Image ProcessImage(Image source, byte red, byte green, byte blue)
        {
            var trimmedColored = new Bitmap(source).Trim().SetRGB(red, green, blue);
            return new Bitmap(ProcessImageSettings.OutputWidth, ProcessImageSettings.OutputHeight)
                .PasteZoomed(trimmedColored, ProcessImageSettings.Position)
                .Multiply(Properties.Resources.Texture)
                .AddBorder(ProcessImageSettings.BorderSize)
                .AddDropShadow(ProcessImageSettings.DropShadowSize, ProcessImageSettings.DropShadowOffsetX, ProcessImageSettings.DropShadowOffsetY, ProcessImageSettings.DropShadowOpacity);
        }

        /// <summary>
        /// Get a color for the character's team
        /// </summary>
        /// <param name="team"></param>
        /// <returns></returns>
        internal static (byte, byte, byte) GetColorForTeam(SaveTeam.TeamValue team)
        {
            // TODO: should be a gradient
            // TODO: should come from settings
            switch (team)
            {
                case SaveTeam.TeamValue.Townsfolk:
                    return ProcessImageSettings.TownsfolkColor;
                case SaveTeam.TeamValue.Outsider:
                    return ProcessImageSettings.OutsiderColor;
                case SaveTeam.TeamValue.Minion:
                    return ProcessImageSettings.MinionColor;
                case SaveTeam.TeamValue.Demon:
                    return ProcessImageSettings.DemonColor;
                case SaveTeam.TeamValue.Traveler:
                default:
                    return ProcessImageSettings.TravelerColor;
            }
            throw new System.Exception("Unhandled team in GetColorForTeam");
        }
    }
}
