using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;

namespace BloodstarClockticaLib
{
    public class BcOfficial
    {
        /// <summary>
        /// data for an official character
        /// </summary>
        public class OfficialCharacter
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
            public OfficialCharacter()
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

        /// <summary>
        /// lazily-created list of official characters
        /// </summary>
        private static IEnumerable<OfficialCharacter> _officialCharacters;

        /// <summary>
        /// lazily-created list of official characters
        /// </summary>
        public static IEnumerable<OfficialCharacter> OfficialCharacters
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
        private static void AddImageLinksForOfficialCharacters(IEnumerable<OfficialCharacter> officialCharacters)
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
        /// available editions
        /// </summary>
        private IEnumerable<string> OfficialEditions => new SortedSet<string>(from oc in OfficialCharacters select oc.Edition);

        /// <summary>
        /// all available characters' names
        /// </summary>
        private IEnumerable<string> OfficialCharacterNames => new SortedSet<string>(from oc in OfficialCharacters select oc.Name);

        /// <summary>
        /// names of characters by edition
        /// </summary>
        private IEnumerable<string> NamesInEdition(string edition) => new SortedSet<string>(
            from oc in OfficialCharacters
            where oc.Edition == edition
            select oc.Name);

        /// <summary>
        /// load up the roles.json and convert to dictionary of OfficialCharacter
        /// </summary>
        /// <returns></returns>
        private static IEnumerable<OfficialCharacter> ParseOfficialCharacters()
        {
            var list = new List<OfficialCharacter>();
            var bytes = Encoding.UTF8.GetBytes(Properties.Resources.OfficialRolesJson);
            var json = new Utf8JsonReader(bytes);

            // skip start array token
            json.Read();
            if (json.TokenType != JsonTokenType.StartArray) { throw new FormatException("root of roles.json should be an array"); }

            while (json.Read())
            {
                if (json.TokenType == JsonTokenType.EndArray)
                {
                    // finished
                    break;
                }
                else if (json.TokenType == JsonTokenType.StartObject)
                {
                    // read a character
                    OfficialCharacter character = ParseOfficialCharacter(ref json);
                    if ((character != null) && (character.Id != "_meta"))
                    {
                        list.Add(character);
                    }
                }
                else
                {
                    throw new FormatException("Error while reading official roles.json");
                }
            }

            return list;
        }

        /// <summary>
        /// read the next official character
        /// </summary>
        /// <param name="json"></param>
        /// <returns></returns>
        private static OfficialCharacter ParseOfficialCharacter(ref Utf8JsonReader json)
        {
            OfficialCharacter officialCharacter = new OfficialCharacter();

            // (skipping object start token)
            while (json.Read())
            {
                if (json.TokenType == JsonTokenType.EndObject)
                {
                    // finished
                    break;
                }
                else if (json.TokenType == JsonTokenType.PropertyName)
                {
                    string propertyName = json.GetString();
                    json.Read();
                    switch (propertyName)
                    {
                        case "id":
                            officialCharacter.Id = json.GetString();
                            break;
                        case "edition":
                            officialCharacter.Edition = json.GetString();
                            break;
                        case "image":
                            officialCharacter.ImageUrl = json.GetString();
                            break;
                        case "firstNightReminder":
                            officialCharacter.FirstNightReminder = json.GetString();
                            break;
                        case "otherNightReminder":
                            officialCharacter.OtherNightReminder = json.GetString();
                            break;
                        case "reminders":
                            officialCharacter.Reminders = ReadReminders(ref json);
                            break;
                        case "remindersGlobal":
                            officialCharacter.RemindersGlobal = ReadReminders(ref json);
                            break;
                        case "setup":
                            officialCharacter.Setup = json.GetBoolean();
                            break;
                        case "name":
                            officialCharacter.Name = json.GetString();
                            break;
                        case "team":
                            officialCharacter.Team = BcTeam.FromString(json.GetString());
                            break;
                        case "ability":
                            officialCharacter.Ability = json.GetString();
                            break;
                    }
                }
                else
                {
                    throw new FormatException("Error while reading character from roles.json");
                }
            }

            return officialCharacter;
        }

        /// <summary>
        /// read an array of strings
        /// </summary>
        /// <param name="json"></param>
        /// <returns></returns>
        private static IEnumerable<string> ReadReminders(ref Utf8JsonReader json)
        {
            var list = new List<String>();

            // (skipping object array token)
            while (json.Read())
            {
                if (json.TokenType == JsonTokenType.EndArray)
                {
                    // finished
                    break;
                }
                else if (json.TokenType == JsonTokenType.String)
                {
                    list.Add(json.GetString());
                }
                else
                {
                    throw new FormatException("Error while reading reminders in roles.json");
                }
            }

            return list;
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
            var bcCharacter = (document != null) ? new BcCharacter(document) : new BcCharacter();

            int i = 1;

            var newId = id + i;
            if (document != null)
            {
                while (!document.IsIdAvailable(newId, -1))
                {
                    ++i;
                    newId = id + i;
                }
            }
            bcCharacter.Id = newId;

            bcCharacter.Name = officialCharacter.Name;
            bcCharacter.Team = officialCharacter.Team;
            bcCharacter.Ability = officialCharacter.Ability;
            bcCharacter.ReminderTokens = new List<string>(officialCharacter.Reminders);
            bcCharacter.GlobalReminderTokens = new List<string>(officialCharacter.RemindersGlobal);
            bcCharacter.Setup = officialCharacter.Setup;
            bcCharacter.FirstNightOrder = 0;
            bcCharacter.FirstNightReminder = officialCharacter.FirstNightReminder;
            bcCharacter.OtherNightOrder = 0;
            bcCharacter.OtherNightReminder = officialCharacter.OtherNightReminder;
            try
            {
                if (!string.IsNullOrWhiteSpace(officialCharacter.ImageUrl))
                {
                    bcCharacter.ProcessedImage = DownloadImage(officialCharacter.ImageUrl);
                }
            }
            catch (System.Net.WebException)
            {
                Console.WriteLine("Failed to download image ({officialCharacter.ImageUrl})");
            }

            return bcCharacter;
        }

        /// <summary>
        /// download the image for the character
        /// throws System.Net.WebException if it fails to download
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        private static Image DownloadImage(string url)
        {
            using (var webClient = new WebClient())
            {
                var stream = new MemoryStream(webClient.DownloadData(url));
                return Image.FromStream(stream);
            }
        }
    }
}
