import BloodBind from './blood-bind.js';

let uuid_counter = 0;
function gen_uuid()
{
    const now = new Date();
    let random = '';
    for (let i=0; i<4; ++i)
    {
        random += (Math.random()*16|0).toString(16);
    }
    ++uuid_counter;
    return `${now.getFullYear()}.${now.getMonth()}.${now.getDate()}.${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}.${now.getMilliseconds()}.${random}.${uuid_counter}`;
}

  export class BloodTeam {
    static TOWNSFOLK = 'townsfolk';
    static OUTSIDER = 'outsider';
    static MINION = 'minion';
    static DEMON = 'demon';
    static TRAVELER = 'traveler';
    static TOWNSFOLK_DISPLAY = 'Townsfolk';
    static OUTSIDER_DISPLAY = 'Outsider';
    static MINION_DISPLAY = 'Minion';
    static DEMON_DISPLAY = 'Demon';
    static TRAVELER_DISPLAY = 'Traveler';
    static toIdString(displayString) {
        switch (displayString.toLowerCase())
        {
            case "townsfolk":
                return BloodTeam.TOWNSFOLK;
            case "outsider":
                return BloodTeam.OUTSIDER;
            case "minion":
                return BloodTeam.MINION;
            case "demon":
                return BloodTeam.DEMON;
            case "traveller":
            case "traveler":
                return BloodTeam.TRAVELER;
        }
    }
    static toDisplayString(teamString) {
        switch (teamString.toLowerCase())
        {
            case "townsfolk":
                return BloodTeam.TOWNSFOLK_DISPLAY;
            case "outsider":
                return BloodTeam.OUTSIDER_DISPLAY;
            case "minion":
                return BloodTeam.MINION_DISPLAY;
            case "demon":
                return BloodTeam.DEMON_DISPLAY;
            case "traveller":
            case "traveler":
                return BloodTeam.TRAVELER_DISPLAY;
        }
    }

    /// {display, value}
    static options() {
        return [
            {display: BloodTeam.TOWNSFOLK_DISPLAY, value: BloodTeam.TOWNSFOLK},
            {display: BloodTeam.OUTSIDER_DISPLAY, value: BloodTeam.OUTSIDER},
            {display: BloodTeam.MINION_DISPLAY, value: BloodTeam.MINION},
            {display: BloodTeam.DEMON_DISPLAY, value: BloodTeam.DEMON},
            {display: BloodTeam.TRAVELER_DISPLAY, value: BloodTeam.TRAVELER}
        ];
    }
}
export class BloodDocumentMeta {
    constructor() {
        this.name = 'New Edition';
        this.author = '';
        this.logo = null;
        this.almanac = new BloodDocumentMetaAlmanac();
    }
    /// DESTRUCTIVE
    reset() {
        this.name = 'New Edition';
        this.author = '';
        this.logo = null;
        this.almanac.reset();
    }
    getJson() {
        return '{"TODO":"one step at a time"}';
    }
}
export class BloodDocumentMetaAlmanac {
    constructor() {
        this.synopsis = '';
        this.overview = '';
    }
    /// DESTRUCTIVE
    reset() {
        this.synopsis = '';
        this.overview = '';
    }
}
export class BloodCharacter {
    constructor() {
        this.id = new BloodBind.Property('newcharacter');
        this.name = new BloodBind.Property('New Character');
        this.unStyledImage = new BloodBind.Property(null);
        this.styledImage = new BloodBind.Property(null);
        this.team = new BloodBind.EnumProperty(BloodTeam.TOWNSFOLK, BloodTeam.options());
        this.export = new BloodBind.Property(true);
    }
}
export class BloodDocument {
    constructor() {
        this.uuid = new BloodBind.Property(gen_uuid());
        this.previewOnToken = new BloodBind.Property(true);
        this.dirty = new BloodBind.Property(false);
        this.meta = new BloodDocumentMeta();
        this.windowTitle = new BloodBind.Property('Bloodstar Clocktica');
        // TODO: list properties
        this.characterList = [new BloodCharacter()];
        this.firstNightOrder = [];
        this.otherNightOrder = [];

        // TODO: hook up auto-dirty
        // TODO: hook up automatic title change on dirty
    }
    /// DESTRUCTIVE
    reset() {
        this.uuid = new BloodBind.Property(gen_uuid());
        this.previewOnToken.set(true);
        this.meta.reset();
        this.windowTitle.set('Bloodstar Clocktica');

        this.characterList.length = 0;
        this.addNewCharacter();
        this.firstNightOrder = [];
        this.otherNightOrder = [];
        this.dirty.set(false);
    }
    getCharacterList() {
        return this.characterList;
    }
    addNewCharacter() {
        this.characterList.push(new BloodCharacter());
        this.dirty.set(true);
    }
    save() {
        const metaJson = this.meta.getJson();
        const formData = new FormData();
        formData.append('meta.json', metaJson);
        return fetch('https://www.meyermike.com/botc/bloodstarclocktica/test.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(response => {
                console.log(response);
                const {error,success} = response;
                if (error) {
                    throw new Error(error);
                }
            })
            .then(x => {
                this.dirty.set(false);
            })
            .catch(error => {
                console.error(error);
            });
    }
}