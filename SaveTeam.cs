using System;

namespace BloodstarClocktica
{
    class SaveTeam
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
            switch (s)
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
        ///  team enum to name
        /// </summary>
        /// <param name="t"></param>
        /// <returns></returns>
        public static string ToString(TeamValue t)
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
    }
}
