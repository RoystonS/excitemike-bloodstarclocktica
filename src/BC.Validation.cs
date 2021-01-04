using System.Collections.Generic;

namespace BloodstarClocktica
{
    internal static partial class BC
    {
        /// <summary>
        /// validate whether the id is taken
        /// </summary>
        /// <param name="id"></param>
        /// <param name="characterIndex"></param>
        /// <returns>true if the id is a unique one</returns>
        internal static bool ValidateId(string id, int characterIndex)
        {
            for (var i = 0; i < Document.Roles.Count; ++i)
            {
                var character = Document.Roles[i];
                if ((i != characterIndex) && (id == character.Id))
                {
                    return false;
                }
            }
            return true;
        }
    }
}
