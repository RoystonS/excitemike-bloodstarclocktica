import * as BloodBind from './bind/bindings';
import {ObservableCollection} from './bind/observable-collection';
import {ObservableObjectMixin} from './bind/observable-object';

const splitLines = (str:string) => str.split(/\r?\n/);

/** data to persist on the server for the custom edition */
export type CustomEditionSaveData = {
    firstNightOrder:ReadonlyArray<string>,
    meta:CustomEditionMetaSaveData,
    otherNightOrder:ReadonlyArray<string>,
    previewOnToken:boolean,
    characters:ReadonlyArray<CharacterSaveData>
};

/** data to persist on the server for the meta portion of custom edition */
export type CustomEditionMetaSaveData = {
    name: string,
    author: string,
    logo: string|null,
    almanac: CustomEditionMetaAlmanacSaveData
};

/** data to persist on the server for the meta almanac portion of custom edition */
export type CustomEditionMetaAlmanacSaveData = {
    synopsis: string,
    overview: string,
};

/** data to persist on the server for a character */
export type CharacterSaveData = {
    ability:string,
    almanac: CharacterAlmanacSaveData
    attribution:string,
    characterReminderTokens:ReadonlyArray<string>,
    export:boolean,
    firstNightReminder:string,
    globalReminderTokens:ReadonlyArray<string>,
    id:string,
    name:string,
    otherNightReminder:string,
    setup:boolean,
    styledImage:string|null,
    team:string,
    unStyledImage:string|null,
};

/** datato persist on the server for a character's almanac entry */
export type CharacterAlmanacSaveData = {
    flavor: string;
    overview: string;
    examples: string;
    howToRun: string;
    tip: string;
};

export enum BloodTeam {
    TOWNSFOLK = 'townsfolk',
    OUTSIDER = 'outsider',
    MINION = 'minion',
    DEMON = 'demon',
    TRAVELER = 'traveler',
    TOWNSFOLK_DISPLAY = 'Townsfolk',
    OUTSIDER_DISPLAY = 'Outsider',
    MINION_DISPLAY = 'Minion',
    DEMON_DISPLAY = 'Demon',
    TRAVELER_DISPLAY = 'Traveler'
}

/** convert a string to a BloodTeam enum */
export function parseBloodTeam(s:string):BloodTeam {
    switch (s.toLowerCase())
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

/** blood team options prepared for use with a EnumProperty */
export const BLOODTEAM_OPTIONS:ReadonlyArray<{display:string, value:BloodTeam}> = [
    {display: BloodTeam.TOWNSFOLK_DISPLAY, value: BloodTeam.TOWNSFOLK},
    {display: BloodTeam.OUTSIDER_DISPLAY, value: BloodTeam.OUTSIDER},
    {display: BloodTeam.MINION_DISPLAY, value: BloodTeam.MINION},
    {display: BloodTeam.DEMON_DISPLAY, value: BloodTeam.DEMON},
    {display: BloodTeam.TRAVELER_DISPLAY, value: BloodTeam.TRAVELER}
];

/** convert BloodTeam enum to a display string */
export function bloodTeamDisplayString(team:BloodTeam):string {
    switch (team.toLowerCase())
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

class _CustomEditionMeta {
    private name: BloodBind.Property<string>;
    private author: BloodBind.Property<string>;
    private logo: BloodBind.Property<string|null>;
    private almanac: CustomEditionMetaAlmanac;
    constructor() {
        this.name = new BloodBind.Property('New Edition');
        this.author = new BloodBind.Property('');
        this.logo = new BloodBind.Property<string|null>(null);
        this.almanac = new CustomEditionMetaAlmanac();
    }
    /// DESTRUCTIVE
    reset(name:string) {
        this.name.set(name);
        this.author.set('');
        this.logo.set(null);
        this.almanac.reset();
    }

    getAuthorProperty():BloodBind.Property<string> { return this.author; }

    getSaveData() {
        return {
            name: this.name.get(),
            author: this.author.get(),
            logo: this.logo.get(),
            almanac: this.almanac.getSaveData(),
        };
    }

    getLogoProperty():BloodBind.Property<string|null> { return this.logo; }

    getName():string { return this.name.get(); }
    getNameProperty():BloodBind.Property<string> { return this.name; }

    /** get overview for binding */
    getOverviewProperty():BloodBind.Property<string> {
        return this.almanac.getOverviewProperty();
    }

    /** get synopsis for binding */
    getSynopsisProperty():BloodBind.Property<string> {
        return this.almanac.getSynopsisProperty();
    }

    /** set based on save data */
    open(data:CustomEditionMetaSaveData):void {
        this.name.set(data.name);
        this.author.set(data.author);
        this.logo.set(data.logo);
        this.almanac.open(data.almanac);
    }
}
/** observable properties about the edition */
export const CustomEditionMeta = ObservableObjectMixin(_CustomEditionMeta);
/** observable properties about the edition */
export type CustomEditionMeta = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _CustomEditionMeta;

class _CustomEditionMetaAlmanac {
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
    getSaveData():CustomEditionMetaAlmanacSaveData {
        return {
            synopsis: this.synopsis.get(),
            overview: this.overview.get(),
        };
    }

    /** get overview for binding */
    getOverviewProperty():BloodBind.Property<string> {
        return this.overview;
    }

    /** get synopsis for binding */
    getSynopsisProperty():BloodBind.Property<string> {
        return this.synopsis;
    }

    /** set based on save data */
    open(data:CustomEditionMetaAlmanacSaveData):void {
        this.synopsis.set(data.synopsis);
        this.overview.set(data.overview);
    }
}

/** observable properties about the character */
export const CustomEditionMetaAlmanac = ObservableObjectMixin(_CustomEditionMetaAlmanac);
/** observable properties about the edition */
export type CustomEditionMetaAlmanac = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _CustomEditionMetaAlmanac;

class _Character {
    private ability: BloodBind.Property<string>;
    private attribution: BloodBind.Property<string>;
    private almanac: CharacterAlmanac;
    private characterReminderTokens: BloodBind.Property<string>;
    private export: BloodBind.Property<boolean>;
    private firstNightReminderProperty: BloodBind.Property<string>;
    private globalReminderTokens: BloodBind.Property<string>;
    private id: BloodBind.Property<string>;
    private name: BloodBind.Property<string>;
    private otherNightReminderProperty: BloodBind.Property<string>;
    private setup: BloodBind.Property<boolean>;
    private styledImage: BloodBind.Property<string|null>;
    private team: BloodBind.EnumProperty<string>;
    private unStyledImage: BloodBind.Property<string|null>;
    constructor() {
        this.ability = new BloodBind.Property('');
        this.attribution = new BloodBind.Property('');
        this.almanac = new CharacterAlmanac();
        this.characterReminderTokens = new BloodBind.Property<string>('');
        this.export = new BloodBind.Property<boolean>(true);
        this.firstNightReminderProperty = new BloodBind.Property('');
        this.globalReminderTokens = new BloodBind.Property<string>('');
        this.id = new BloodBind.Property('newcharacter');
        this.name = new BloodBind.Property('New Character');
        this.otherNightReminderProperty = new BloodBind.Property('');
        this.setup = new BloodBind.Property<boolean>(false);
        this.styledImage = new BloodBind.Property<string|null>(null);
        this.team = new BloodBind.EnumProperty<string>(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS);
        this.unStyledImage = new BloodBind.Property<string|null>(null);
    }

    /** create from save data */
    static from(data:CharacterSaveData):Character {
        const character = new Character();
        character.open(data);
        return character;
    }

    getAbility():string{return this.ability.get();}
    getAbilityProperty():BloodBind.Property<string>{return this.ability;}
    getAttribution():string{return this.attribution.get();}
    getAttributionProperty():BloodBind.Property<string>{return this.attribution;}
    getAlmanac():CharacterAlmanac { return this.almanac; }
    getAlmanacSaveData():CharacterAlmanacSaveData { return this.almanac.getSaveData(); }
    getCharacterReminderTokens():ReadonlyArray<string> { return splitLines(this.characterReminderTokens.get()); }
    getCharacterReminderTokensProperty():BloodBind.Property<string> { return this.characterReminderTokens; }
    getExport():boolean{return this.export.get();}
    getExportProperty():BloodBind.Property<boolean>{return this.export;}
    getFirstNightReminder():string{return this.firstNightReminderProperty.get();}
    getFirstNightReminderProperty():BloodBind.Property<string>{return this.firstNightReminderProperty;}
    getGlobalReminderTokens():ReadonlyArray<string> { return splitLines(this.globalReminderTokens.get()); }
    getGlobalReminderTokensProperty():BloodBind.Property<string> { return this.globalReminderTokens; }
    getId():string { return this.id.get(); }
    getIdProperty():BloodBind.Property<string>{return this.id;}
    getName():string{return this.name.get();}
    getNameProperty():BloodBind.Property<string>{return this.name;}
    getOtherNightReminder():string{return this.otherNightReminderProperty.get();}
    getOtherNightReminderProperty():BloodBind.Property<string>{return this.otherNightReminderProperty;}

    /** get data to persist for the character */
    getSaveData():CharacterSaveData {
        return {
            ability:this.getAbility(),
            almanac: this.getAlmanacSaveData(),
            attribution:this.getAttribution(),
            characterReminderTokens:this.getCharacterReminderTokens(),
            firstNightReminder:this.getFirstNightReminder(),
            globalReminderTokens:this.getGlobalReminderTokens(),
            id:this.getId(),
            name:this.getName(),
            otherNightReminder:this.getOtherNightReminder(),
            unStyledImage:this.getUnStyledImage(),
            setup:this.getSetup(),
            styledImage:this.getStyledImage(),
            team:this.getTeam(),
            export:this.getExport()
        };
    }

    getSetup():boolean{return this.setup.get();}
    getSetupProperty():BloodBind.Property<boolean>{return this.setup;}
    getStyledImage():string|null{return this.styledImage.get();}
    getStyledImageProperty():BloodBind.Property<string|null>{return this.styledImage;}
    getTeam():BloodTeam{return parseBloodTeam(this.team.get());}
    getTeamProperty():BloodBind.EnumProperty<string>{return this.team;}
    getUnStyledImage():string|null{return this.unStyledImage.get();}
    getUnStyledImageProperty():BloodBind.Property<string|null>{return this.unStyledImage;}

    /** load in save data */
    open(data:CharacterSaveData):void {
        this.ability.set(data.ability);
        this.attribution.set(data.attribution);
        this.almanac.open(data.almanac);
        this.characterReminderTokens.set(data.characterReminderTokens.join('\n'));
        this.export.set(data.export);
        this.firstNightReminderProperty.set(data.firstNightReminder);
        this.globalReminderTokens.set(data.globalReminderTokens.join('\n'));
        this.id.set(data.id);
        this.name.set(data.name);
        this.otherNightReminderProperty.set(data.otherNightReminder);
        this.setup.set(data.setup);
        this.styledImage.set(data.styledImage);
        this.team.set(data.team);
        this.unStyledImage.set(data.unStyledImage);
    }

    setId(value:string):void { this.id.set(value); }
    setName(value:string):void{this.name.set(value);}
}
/** observable properties about the character */
export const Character = ObservableObjectMixin(_Character);
/** observable properties about the edition */
export type Character = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _Character;

class _CharacterAlmanac {
    private flavor: BloodBind.Property<string>;
    private overview: BloodBind.Property<string>;
    private examples: BloodBind.Property<string>;
    private howToRun: BloodBind.Property<string>;
    private tip: BloodBind.Property<string>;

    constructor() {
        this.flavor = new BloodBind.Property<string>('');
        this.overview = new BloodBind.Property<string>('');
        this.examples = new BloodBind.Property<string>('');
        this.howToRun = new BloodBind.Property<string>('');
        this.tip = new BloodBind.Property<string>('');
    }

    /** get data to persist for the character's almanac entry */
    getSaveData():CharacterAlmanacSaveData {
        return {
            flavor:this.getFlavor(),
            overview:this.getOverview(),
            examples:this.getExamples(),
            howToRun:this.getHowToRun(),
            tip:this.getTip(),
        };
    }

    getFlavor():string{return this.flavor.get();}
    getFlavorProperty():BloodBind.Property<string> {return this.flavor;}
    getOverview():string{return this.overview.get();}
    getOverviewProperty():BloodBind.Property<string> {return this.overview;}
    getExamples():string{return this.examples.get();}
    getExamplesProperty():BloodBind.Property<string> {return this.examples;}
    getHowToRun():string{return this.howToRun.get();}
    getHowToRunProperty():BloodBind.Property<string> {return this.howToRun;}
    getTip():string{return this.tip.get();}
    getTipProperty():BloodBind.Property<string> {return this.tip;}
    

    /** load in save data */
    open(data:CharacterAlmanacSaveData):void {
        this.flavor.set(data.flavor);
        this.overview.set(data.overview);
        this.examples.set(data.examples);
        this.howToRun.set(data.howToRun);
        this.tip.set(data.tip);
    }
}

/** observable properties about the character's almanac entry */
export const CharacterAlmanac = ObservableObjectMixin(_CharacterAlmanac);

/** observable properties about the character's almanac entry */
export type CharacterAlmanac = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _CharacterAlmanac;

/** observable properties for a custom edition */
class _CustomEdition {
    private saveName: BloodBind.Property<string>;
    private previewOnToken: BloodBind.Property<boolean>;
    private dirty: BloodBind.Property<boolean>;
    private meta: CustomEditionMeta;
    private windowTitle: BloodBind.Property<string>;
    /** characters in the edition */
    private characterList: ObservableCollection<Character>;
    /** contains the same Character objects as characterList, but ordered for night order */
    private firstNightOrder: ObservableCollection<Character>;
    /** contains the same Character objects as characterList, but ordered for night order */
    private otherNightOrder: ObservableCollection<Character>;

    /** create new edition */
    constructor() {
        this.saveName = new BloodBind.Property<string>('');
        this.previewOnToken = new BloodBind.Property<boolean>(true);
        this.dirty = new BloodBind.Property<boolean>(false);
        this.meta = new CustomEditionMeta();
        this.windowTitle = new BloodBind.Property('Bloodstar Clocktica');
        this.characterList = new ObservableCollection<Character>();
        this.firstNightOrder = new ObservableCollection<Character>();
        this.otherNightOrder = new ObservableCollection<Character>();
        this.addNewCharacter();

        // hook up auto-dirty
        const makeDirty = (_:any) => {
            this.dirty.set(true);
        };
        this.saveName.addListener(makeDirty);
        this.previewOnToken.addListener(makeDirty);
        this.meta.addPropertyChangedEventListener(makeDirty);
        this.characterList.addCollectionChangedListener(makeDirty);
        this.characterList.addItemChangedListener(makeDirty);
        this.firstNightOrder.addCollectionChangedListener(makeDirty);
        this.firstNightOrder.addItemChangedListener(makeDirty);
        this.otherNightOrder.addCollectionChangedListener(makeDirty);
        this.otherNightOrder.addItemChangedListener(makeDirty);

        // automatic title change on dirty
        const updateWindowTitle = ()=>this.windowTitle.set(`${(this.dirty.get() ? '[unsaved changes] ' : '')}${this.saveName.get()}`);
        this.dirty.addListener(_=>updateWindowTitle());
        this.saveName.addListener(_=>updateWindowTitle());
    }

    /** remove the specified character from the collectionlater in the order */
    deleteCharacter(character:Character):void {
        const i = this.characterList.indexOf(character);
        if (i < 0) { return; }
        this.characterList.remove(i);
    }

    /** reset to a blank edition */
    reset() {
        this.saveName.set('');
        this.previewOnToken.set(true);
        this.meta.reset('New Edition');
        this.windowTitle.set('Bloodstar Clocktica');

        this.characterList.clear();
        this.firstNightOrder.clear();
        this.otherNightOrder.clear();
        this.addNewCharacter();

        this.dirty.set(false);
    }

    getCharacterList() {
        return this.characterList;
    }

    /** add a new character to the set */
    addNewCharacter() {
        const character = new Character();
        this.makeNameAndIdUnique(character);
        this.characterList.add(character);
        this.firstNightOrder.add(character);
        this.otherNightOrder.add(character);
    }

    /** make sure the name and id of a newly added character aren't taken */
    makeNameAndIdUnique(character:Character):void {
        let i = 1;
        const originalId = character.getId();
        const originalName = character.getName();
        let matchFound;
        do {
            matchFound = false;
            for (const existingCharacter of this.characterList) {
                if ((existingCharacter.getId() === character.getId()) || (existingCharacter.getName() === character.getName())) {
                    matchFound = true;
                    character.setId(originalId + i);
                    character.setName(originalName + i);
                    i++;
                    break;
                }
            }
        } while (matchFound);
    }

    getDirty():boolean { return this.dirty.get(); }
    setDirty(value:boolean):void {this.dirty.set(value); }

    getAuthorProperty():BloodBind.Property<string> { return this.meta.getAuthorProperty(); }

    getName():string { return this.meta.getName(); }
    getNameProperty():BloodBind.Property<string> { return this.meta.getNameProperty(); }

    getLogoProperty():BloodBind.Property<string|null> { return this.meta.getLogoProperty(); }

    /**
     * get name to save as
     */
    getSaveName():string { return this.saveName.get(); }

    /**
     * set name to save as
     */
    setSaveName(value:string):void { this.saveName.set(value); }

    /**
     * object to serialize as save file
     */ 
    getSaveData():CustomEditionSaveData {
        const firstNightOrderSaveData:string[] = this.firstNightOrder.map(c=>c.getId());
        const otherNightOrderSaveData:string[] = this.otherNightOrder.map(c=>c.getId());
        const charactersSaveData:CharacterSaveData[] = this.characterList.map(c=>c.getSaveData());
        return {
            firstNightOrder:firstNightOrderSaveData,
            meta: this.meta.getSaveData(),
            otherNightOrder:otherNightOrderSaveData,
            previewOnToken:this.previewOnToken.get(),
            characters:charactersSaveData
        };
    };

    getPreviewOnTokenProperty():BloodBind.Property<boolean> { return this.previewOnToken; }

    /** get overview for binding */
    getOverviewProperty():BloodBind.Property<string> {
        return this.meta.getOverviewProperty();
    }

    /** get synopsis for binding */
    getSynopsisProperty():BloodBind.Property<string> {
        return this.meta.getSynopsisProperty();
    }

    /** move the specified character earlier in the order */
    moveCharacterUp(character:Character):void {
        const i = this.characterList.indexOf(character);
        if (i < 1) { return; }
        this.characterList.move(i, i-1);
    }

    /** move the specified character later in the order */
    moveCharacterDown(character:Character):void {
        const i = this.characterList.indexOf(character);
        if (i < 0) { return; }
        this.characterList.move(i, i+1);
    }

    /**
     * set to opened file
     * @param data 
     */
     open(saveName:string, data:CustomEditionSaveData):boolean {
        this.saveName.set(saveName);
        
        this.meta.open(data.meta);
        
        this.characterList.set(data.characters.map(characterSaveData=>Character.from(characterSaveData)));

        const charactersById = new Map<string, Character>();
        {
            for (const character of this.characterList) {
                charactersById.set(character.getId(), character);
            }
        }

        this.firstNightOrder.set(data.firstNightOrder.map(id=>charactersById.get(id) || new Character()));
        this.otherNightOrder.set(data.otherNightOrder.map(id=>charactersById.get(id) || new Character()));

        this.dirty.set(false);

        return true;
    }
}

/** observable properties for a custom edition */
export const CustomEdition = ObservableObjectMixin(_CustomEdition);
export type CustomEdition = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _CustomEdition;