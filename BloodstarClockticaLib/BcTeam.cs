using System;

namespace BloodstarClockticaLib
{
    public class BcTeam
    {
        public enum TeamValue
        {
            Townsfolk,
            Outsider,
            Minion,
            Demon,
            Traveler
        }

        public static TeamValue FromString(string s)
        {
            switch (s.ToLower())
            {
                case "townsfolk":
                    return TeamValue.Townsfolk;
                case "outsider":
                    return TeamValue.Outsider;
                case "minion":
                    return TeamValue.Minion;
                case "demon":
                    return TeamValue.Demon;
                case "traveler":
                    return TeamValue.Traveler;
                default:
                    throw new ArgumentException($"Unhandled Team string \"{s}\"");
            }
        }

        /// <summary>
        /// team enum to name
        /// </summary>
        /// <param name="t"></param>
        /// <returns></returns>
        public static string ToExportString(TeamValue t)
        {
            switch (t)
            {
                case TeamValue.Townsfolk:
                    return "townsfolk";
                case TeamValue.Outsider:
                    return "outsider";
                case TeamValue.Minion:
                    return "minion";
                case TeamValue.Demon:
                    return "demon";
                case TeamValue.Traveler:
                    return "traveler";
                default:
                    throw new ArgumentException($"Unhandled Team Enum \"{t}\"");
            }
        }

        /// <summary>
        ///  team enum to name
        /// </summary>
        /// <param name="t"></param>
        /// <returns></returns>
        public static string ToDisplayString(TeamValue t)
        {
            switch (t)
            {
                case TeamValue.Townsfolk:
                    return "Townsfolk";
                case TeamValue.Outsider:
                    return "Outsider";
                case TeamValue.Minion:
                    return "Minion";
                case TeamValue.Demon:
                    return "Demon";
                case TeamValue.Traveler:
                    return "Traveler";
                default:
                    throw new ArgumentException($"Unhandled Team Enum \"{t}\"");
            }
        }
    }
}
