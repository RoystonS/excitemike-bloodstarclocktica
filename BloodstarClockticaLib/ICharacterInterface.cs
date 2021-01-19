namespace BloodstarClockticaLib
{
    public interface ICharacterInterface
    {
        string Id { get; set; }
        string Name { get; set; }
        string Ability { get; set; }
        BcTeam.TeamValue Team { get; set; }

        /// <summary>
        /// see if the character contains that text somewhere
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        bool PassesFilter(string s);
    }
}
