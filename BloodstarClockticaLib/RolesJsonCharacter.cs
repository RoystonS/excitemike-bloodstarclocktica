using System.Collections.Generic;

namespace BloodstarClockticaLib
{
    /// <summary>
    /// data for a character imported from roles.json
    /// </summary>
    public class RolesJsonCharacter : ICharacterInterface
    {
        public string Id { get; set; }
        public string Edition { get; set; }
        public string ImageUrl { get; set; }
        public string FirstNightReminder { get; set; }
        public string OtherNightReminder { get; set; }
        public IEnumerable<string> Reminders { get; set; }
        public IEnumerable<string> RemindersGlobal { get; set; }
        public bool Setup { get; set; }
        public string Name { get; set; }
        public BcTeam.TeamValue Team { get; set; }
        public string Ability { get; set; }
        public RolesJsonCharacter()
        {
            Id = "";
            Edition = "";
            ImageUrl = "";
            FirstNightReminder = "";
            OtherNightReminder = "";
            Reminders = new string[] { };
            RemindersGlobal = new string[] { };
            Setup = false;
            Name = "";
            Team = BcTeam.TeamValue.Townsfolk;
            Ability = "";
        }

        /// <summary>
        /// see if the character contains that text somewhere
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public bool PassesFilter(string s)
        {
            var needle = s.ToLower();
            if (string.IsNullOrWhiteSpace(s))
            {
                return true;
            }
            var haystacks = new string[] {
                    Id,
                    Edition,
                    ImageUrl,
                    FirstNightReminder,
                    OtherNightReminder,
                    string.Join("\n", Reminders),
                    string.Join("\n", RemindersGlobal),
                    Name,
                    BcTeam.ToExportString(Team),
                    Ability};
            foreach (var haystack in haystacks)
            {
                if (haystack.ToLower().Contains(needle))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
