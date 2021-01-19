using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;

namespace BloodstarClockticaLib
{
    public class BcImport
    {
        /// <summary>
        /// load roles based on a file path
        /// </summary>
        /// <param name="filepath"></param>
        /// <returns></returns>
        public static IEnumerable<RolesJsonCharacter> ParseRolesJsonFromFile(string filepath)
        {
            try
            {
                using (var stream = new FileStream(filepath, FileMode.Open))
                {
                    return ParseRolesJson(stream);
                }
            }
            catch (JsonException e)
            {
                throw new InvalidDataException(e.Message, e);
            }
        }
        /// <summary>
        /// load roles from a UTF-8-encoded JSON string 
        /// </summary>
        /// <param name="jsonString"></param>
        /// <returns></returns>
        public static IEnumerable<RolesJsonCharacter> ParseRolesJsonFromString(string jsonString)
        {
            try
            {
                var bytes = Encoding.UTF8.GetBytes(jsonString);
                return ParseRolesJson(bytes);
            }
            catch (JsonException e)
            {
                throw new InvalidDataException(e.Message, e);
            }
        }
        /// <summary>
        /// load roles from a UTF-8-encoded JSON string 
        /// </summary>
        /// <param name="bytes"></param>
        /// <returns></returns>
        public static IEnumerable<RolesJsonCharacter> ParseRolesJson(byte[] bytes)
        {
            try
            {
                var json = new Utf8JsonReader(bytes);
                return ParseRolesJson(json);
            }
            catch (JsonException e)
            {
                throw new InvalidDataException(e.Message, e);
            }
        }
        /// <summary>
        /// load roles from a stream of UTF-8-encoded JSON
        /// </summary>
        /// <param name="stream"></param>
        /// <returns></returns>
        public static IEnumerable<RolesJsonCharacter> ParseRolesJson(Stream stream)
        {
            try
            {
                var ms = new MemoryStream();
                stream.CopyTo(ms);
                Utf8JsonReader json = new Utf8JsonReader(new ReadOnlySpan<byte>(ms.ToArray()));
                return ParseRolesJson(json);
            }
            catch (JsonException e)
            {
                throw new InvalidDataException(e.Message, e);
            }
        }
        /// <summary>
        /// read roles from a Utf8JsonReader
        /// </summary>
        /// <param name="json"></param>
        /// <returns></returns>
        internal static IEnumerable<RolesJsonCharacter> ParseRolesJson(Utf8JsonReader json)
        {
            var list = new List<RolesJsonCharacter>();

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
                    RolesJsonCharacter character = ParseRolesJsonCharacter(ref json);
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
        private static RolesJsonCharacter ParseRolesJsonCharacter(ref Utf8JsonReader json)
        {
            RolesJsonCharacter officialCharacter = new RolesJsonCharacter();

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
            var list = new List<string>();

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
        /// import a character
        /// </summary>
        /// <param name="document">if not null, used to ensure unique ids</param>
        /// <param name="id"></param>
        /// <returns></returns>
        public static BcCharacter ImportCharacter(BcDocument document, RolesJsonCharacter character, bool mustChangeId)
        {
            var bcCharacter = (document != null) ? new BcCharacter(document) : new BcCharacter();

            var newId = character.Id;
            if ((document != null) && (mustChangeId || !document.IsIdAvailable(newId)))
            {
                int i = 1;
                newId = character.Id + i;
                while (!document.IsIdAvailable(newId))
                {
                    ++i;
                    newId = character.Id + i;
                }
            }
            bcCharacter.Id = newId;

            bcCharacter.Name = character.Name;
            bcCharacter.Team = character.Team;
            bcCharacter.Ability = character.Ability;
            bcCharacter.ReminderTokens = new List<string>(character.Reminders);
            bcCharacter.GlobalReminderTokens = new List<string>(character.RemindersGlobal);
            bcCharacter.Setup = character.Setup;
            bcCharacter.FirstNightOrder = 0;
            bcCharacter.FirstNightReminder = character.FirstNightReminder;
            bcCharacter.OtherNightOrder = 0;
            bcCharacter.OtherNightReminder = character.OtherNightReminder;
            if (!string.IsNullOrWhiteSpace(character.ImageUrl))
            {
                try
                {
                    bcCharacter.ProcessedImage = DownloadImage(character.ImageUrl);
                }
                catch (System.Net.WebException)
                {
                    bcCharacter.ProcessedImage = Properties.Resources.DownloadError;
                }
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
