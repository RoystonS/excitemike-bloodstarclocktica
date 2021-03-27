using System;
using System.Text.Json;

namespace BloodstarClockticaLib
{
    public class BcCharacterAlmanacEntry
    {
        /// <summary>
        /// Flavor text for the character. For official sets, these are written as though spoken by the character.
        /// </summary>
        public string Flavor { get; set; }

        /// <summary>
        /// Typically begins with a short, high-level description of what the character does followed by detailed clarifications of the ability.
        /// </summary>
        public string Overview { get; set; }

        /// <summary>
        /// Describe a few newline-separated game situations to help illustrate how the ability works and interacts with other characters.
        /// </summary>
        public string Examples { get; set; }

        /// <summary>
        /// Describe what the storyteller needs to do for this character. Include anything like any additional setup (like the Washewoman's reminder tokens), or the process for waking the player at night, if they apply.
        /// </summary>
        public string HowToRun { get; set; }

        /// <summary>
        /// Newline-separated tips for how to run the character well. Not all characters need this!
        /// For example, the Ravenkeeper's reads: "We advise you to discourage or even ban players from taling about what they are doing at night as they are doing it."
        /// </summary>
        public string Tip { get; set; }

        public BcCharacterAlmanacEntry()
        {
            Flavor = "";
            Overview = "";
            Examples = "";
            HowToRun = "";
            Tip = "";
        }

        /// <summary>
        /// read from json
        /// </summary>
        /// <param name="json"></param>
        public BcCharacterAlmanacEntry(Utf8JsonReader json)
        {
            if (json.TokenType != JsonTokenType.StartObject) { throw new Exception("Expected an object for almanac entries"); }

            while (json.Read())
            {
                if (json.TokenType == JsonTokenType.EndObject)
                {
                    break;
                }
                else if (json.TokenType == JsonTokenType.PropertyName)
                {
                    string propertyName = json.GetString();
                    json.Read();
                    switch (propertyName)
                    {
                        case "flavor":
                            Flavor = json.GetString();
                            break;
                        case "overview":
                            Overview = json.GetString();
                            break;
                        case "examples":
                            Examples = json.GetString();
                            break;
                        case "howToRun":
                            HowToRun = json.GetString();
                            break;
                        case "tip":
                            Tip = json.GetString();
                            break;
                        default:
                            Console.Error.WriteLine($"unhandled property: \"{propertyName}\"");
                            json.Skip();
                            break;
                    }
                }
            }
        }

        /// <summary>
        /// write to JSON
        /// </summary>
        /// <param name="json"></param>
        public void Save(Utf8JsonWriter json, string propertyName)
        {
            json.WriteStartObject(propertyName);
            json.WriteString("flavor", Flavor);
            json.WriteString("overview", Overview);
            json.WriteString("examples", Examples);
            json.WriteString("howToRun", HowToRun);
            json.WriteString("tip", Tip);
            json.WriteEndObject();
        }
    }
}
