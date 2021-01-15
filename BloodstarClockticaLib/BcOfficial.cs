using System.Collections.Generic;
using System.Linq;
using static BloodstarClockticaLib.BcImport;

namespace BloodstarClockticaLib
{
    public class BcOfficial
    {
        /// <summary>
        /// lazily-created list of official characters
        /// </summary>
        private static IEnumerable<RolesJsonCharacter> _officialCharacters;

        /// <summary>
        /// lazily-created list of official characters
        /// </summary>
        public static IEnumerable<RolesJsonCharacter> OfficialCharacters
        {
            get
            {
                if (null == _officialCharacters)
                {
                    _officialCharacters = ParseOfficialCharacters();
                    AddImageLinksForOfficialCharacters(_officialCharacters);
                }
                return _officialCharacters;
            }
        }

        /// <summary>
        /// official roles.json left out the image links for some reason
        /// </summary>
        /// <param name="officialCharacters"></param>
        private static void AddImageLinksForOfficialCharacters(IEnumerable<RolesJsonCharacter> officialCharacters)
        {
            foreach (var c in officialCharacters)
            {
                if (string.IsNullOrWhiteSpace(c.ImageUrl))
                {
                    c.ImageUrl = $"https://raw.githubusercontent.com/bra1n/townsquare/main/src/assets/icons/{c.Id}.png";
                }
            }
        }

        /// <summary>
        /// load up the roles.json and convert to dictionary of OfficialCharacter
        /// </summary>
        /// <returns></returns>
        private static IEnumerable<RolesJsonCharacter> ParseOfficialCharacters()
        {
            return BcImport.ParseRolesJsonFromString(Properties.Resources.OfficialRolesJson);
        }

        /// <summary>
        /// create a clone of an official character
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static BcCharacter CloneOfficialCharacter(string id)
        {
            return CloneOfficialCharacter(null, id);
        }

        /// <summary>
        /// create a clone of an official character
        /// </summary>
        /// <param name="document">if not null, used to ensure unique ids</param>
        /// <param name="id"></param>
        /// <returns></returns>
        public static BcCharacter CloneOfficialCharacter(BcDocument document, string id)
        {
            var officialCharacter = OfficialCharacters.First(c => c.Id == id);
            if (null == officialCharacter)
            {
                return null;
            }
            return ImportCharacter(document, officialCharacter, true);
        }
    }
}
