import * as BloodBind from './blood-bind';
import * as LoadDlg from './dlg/blood-loading-dlg';

type SaveData = {
    bloodId:string,
    check:number,
    'meta.json':string,
    src_images:{[key:string]:string},
    roles:{[key:string]:string},
    processed_images:{[key:string]:string},
};

let bloodIdCounter = -1;
function genBloodId()
{
    const now = new Date();
    let random = '';
    for (let i=0; i<4; ++i)
    {
        random += (Math.random()*16|0).toString(16);
    }
    ++bloodIdCounter;
    return `${now.getFullYear()}.${now.getMonth()}.${now.getDate()}.${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}.${now.getMilliseconds()}.${random}.${bloodIdCounter}`;
}

function hashFunc(input:string) {
    let hash = 0;
    input += '; So say we all.';
    for (var i=0; i<input.length; ++i) {
        const char = input.charCodeAt(i);
        hash = ((hash<<5)-hash) + char;
        hash = hash|0;
    }
    return hash;
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
    static toIdString(displayString:string) {
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
            default:
                return BloodTeam.TOWNSFOLK;
        }
    }
    static toDisplayString(teamString:string) {
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
            default:
                return BloodTeam.TOWNSFOLK_DISPLAY;
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
    private name: BloodBind.Property<string>;
    private author: BloodBind.Property<string>;
    private logo: BloodBind.Property<string|null>;
    private almanac: BloodDocumentMetaAlmanac;
    constructor() {
        this.name = new BloodBind.Property('New Edition');
        this.author = new BloodBind.Property('');
        this.logo = new BloodBind.Property<string|null>(null);
        this.almanac = new BloodDocumentMetaAlmanac();
    }
    /// DESTRUCTIVE
    reset(name:string) {
        this.name.set(name);
        this.author.set('');
        this.logo.set(null);
        this.almanac.reset();
    }
    getSaveData() {
        return {
            name: this.name.get(),
            author: this.author.get(),
            logo: this.logo.get(),
            almanac: this.almanac.getSaveData(),
        };
    }
    getName():string { return this.name.get(); }
}
export class BloodDocumentMetaAlmanac {
    private synopsis: BloodBind.Property<string>;
    private overview: BloodBind.Property<string>;
    constructor() {
        this.synopsis = new BloodBind.Property('');
        this.overview = new BloodBind.Property('');
    }
    /// DESTRUCTIVE
    reset() {
        this.synopsis.set('');
        this.overview.set('');
    }
    getSaveData() {
        return {
            synopsis: this.synopsis.get(),
            overview: this.overview.get(),
        };
    }
}
export class BloodCharacter {
    private id: BloodBind.Property<string>;
    private name: BloodBind.Property<string>;
    private unStyledImage: BloodBind.Property<string|null>;
    private styledImage: BloodBind.Property<string|null>;
    private team: BloodBind.Property<string>;
    private export: BloodBind.Property<boolean>;
    constructor() {
        this.id = new BloodBind.Property('newcharacter');
        this.name = new BloodBind.Property('New Character');
        this.unStyledImage = new BloodBind.Property<string|null>(null);
        this.styledImage = new BloodBind.Property<string|null>(null);
        this.team = new BloodBind.EnumProperty(BloodTeam.TOWNSFOLK, BloodTeam.options());
        this.export = new BloodBind.Property<boolean>(true);
    }
    getIdProperty():BloodBind.Property<string>{return this.id;}
    getNameProperty():BloodBind.Property<string>{return this.name;}
    getName():string{return this.name.get();}
    getUnStyledImageProperty():BloodBind.Property<string|null>{return this.unStyledImage;}
    getStyledImageProperty():BloodBind.Property<string|null>{return this.styledImage;}
    getTeamPropertyProperty():BloodBind.Property<string>{return this.team;}
    getExportProperty():BloodBind.Property<boolean>{return this.export;}
}
export class BloodDocument {
    private bloodId: string;
    private previewOnToken: BloodBind.Property<boolean>;
    private dirty: BloodBind.Property<boolean>;
    private meta: BloodDocumentMeta;
    private windowTitle: BloodBind.Property<string>;
    private characterList: BloodCharacter[];
    private firstNightOrder: bigint[];
    private otherNightOrder: bigint[];
    constructor() {
        this.bloodId = genBloodId();
        this.previewOnToken = new BloodBind.Property<boolean>(true);
        this.dirty = new BloodBind.Property<boolean>(false);
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
    reset(name:string) {
        this.bloodId = genBloodId();
        this.previewOnToken.set(true);
        this.meta.reset(name);
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
    async saveAs(_name:string):Promise<boolean> {
        throw new Error("not yet implemented");
    }
    async save():Promise<boolean> {
        return await LoadDlg.show(this._save());
    }
    async _save():Promise<boolean> {
        const saveData:SaveData = {
            bloodId: this.bloodId,
            check: hashFunc(this.bloodId),
            'meta.json': JSON.stringify(this.meta.getSaveData()),
            src_images:{},
            roles:{},
            processed_images:{}
        };
        const response = await fetch('https://www.meyermike.com/bloodstar/save.php', {
                method: 'POST',
                headers:{'Content-Type': 'application/json'},
                body: JSON.stringify(saveData)
            });
        const responseText = await response.text();
        const responseJson = JSON.parse(responseText);
        const {error} = responseJson;
        if (error) {
            throw new Error(error);
        }
        this.dirty.set(false);
        return true;
    }
    async open(_name:string) {
        //const openData = {
        //    bloodId: this.bloodId,
        //    check: hashFunc(this.bloodId),
        //    name: name
        //};
        //const response = await fetch('https://www.meyermike.com/bloodstar/open.php', {
        //        method: 'POST',
        //        headers:{'Content-Type': 'application/json'},
        //        body: JSON.stringify(openData)
        //    });
        throw new Error('not yet implemented');
    }
    getDirty():boolean { return this.dirty.get(); }
    getName():string { return this.meta.getName(); }
    getFirstNightOrder():bigint[] {
        return this.firstNightOrder;
    }
    getOtherNightOrder():bigint[] {
        return this.otherNightOrder;
    }
}