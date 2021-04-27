import * as BloodBind from './blood-bind';
import {ObservableCollection} from './bind/observable-collection';
import {ObservableObjectMixin} from './bind/observable-object';

export type CustomEditionSaveData = {
    firstNightOrder:string[],
    meta:string,
    otherNightOrder:string[],
    previewOnToken:boolean,
    processed_images:{[key:string]:string},
    roles:{[key:string]:string},
    src_images:{[key:string]:string},
};

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
export class _CustomEditionMeta {
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
}
/** observable properties about the edition */
export const CustomEditionMeta = ObservableObjectMixin(_CustomEditionMeta);
/** observable properties about the edition */
export type CustomEditionMetaType = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _CustomEditionMeta;


export class CustomEditionMetaAlmanac {
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

    /** get overview for binding */
    getOverviewProperty():BloodBind.Property<string> {
        return this.overview;
    }

    /** get synopsis for binding */
    getSynopsisProperty():BloodBind.Property<string> {
        return this.synopsis;
    }
}
export class _Character {
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
    getId():string { return this.id.get(); }
    getIdProperty():BloodBind.Property<string>{return this.id;}
    getNameProperty():BloodBind.Property<string>{return this.name;}
    getName():string{return this.name.get();}
    getUnStyledImageProperty():BloodBind.Property<string|null>{return this.unStyledImage;}
    getStyledImageProperty():BloodBind.Property<string|null>{return this.styledImage;}
    getTeamPropertyProperty():BloodBind.Property<string>{return this.team;}
    getExportProperty():BloodBind.Property<boolean>{return this.export;}
}
/** observable properties about the character */
export const Character = ObservableObjectMixin(_Character);
/** observable properties about the edition */
export type CharacterType = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _Character;


/** observable properties for a custom edition */
class _CustomEdition {
    private saveName: BloodBind.Property<string>;
    private previewOnToken: BloodBind.Property<boolean>;
    private dirty: BloodBind.Property<boolean>;
    private meta: CustomEditionMetaType;
    private windowTitle: BloodBind.Property<string>;
    /** characters in the edition */
    private characterList: ObservableCollection<CharacterType>;
    /** contains the same Character objects as characterList, but ordered for night order */
    private firstNightOrder: ObservableCollection<CharacterType>;
    /** contains the same Character objects as characterList, but ordered for night order */
    private otherNightOrder: ObservableCollection<CharacterType>;

    /** create new edition */
    constructor() {
        this.saveName = new BloodBind.Property<string>('');
        this.previewOnToken = new BloodBind.Property<boolean>(true);
        this.dirty = new BloodBind.Property<boolean>(false);
        this.meta = new CustomEditionMeta();
        this.windowTitle = new BloodBind.Property('Bloodstar Clocktica');
        this.characterList = new ObservableCollection<CharacterType>();
        this.firstNightOrder = new ObservableCollection<CharacterType>();
        this.otherNightOrder = new ObservableCollection<CharacterType>();
        this.addNewCharacter();

        // hook up auto-dirty
        const makeDirty = (_:any) => {
            this.dirty.set(true);
        };
        this.saveName.addListener(makeDirty);
        this.previewOnToken.addListener(makeDirty);
        this.meta.addPropertyChangedEventListener(makeDirty);
        this.characterList.addCollectionChangedListener(makeDirty);
        this.firstNightOrder.addCollectionChangedListener(makeDirty);
        this.otherNightOrder.addCollectionChangedListener(makeDirty);

        // automatic title change on dirty
        const updateWindowTitle = ()=>this.windowTitle.set(`${(this.dirty.get() ? '[unsaved changes] ' : '')}${this.saveName.get()}`);
        this.dirty.addListener(_=>updateWindowTitle());
        this.saveName.addListener(_=>updateWindowTitle());
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
        this.characterList.add(character);
        this.firstNightOrder.add(character);
        this.otherNightOrder.add(character);
    }

    getDirty():boolean { return this.dirty.get(); }
    setDirty(value:boolean):void {this.dirty.set(value); }

    getAuthorProperty():BloodBind.Property<string> { return this.meta.getAuthorProperty(); }

    getName():string { return this.meta.getName(); }
    getNameProperty():BloodBind.Property<string> { return this.meta.getNameProperty(); }

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
        return {
            firstNightOrder:firstNightOrderSaveData,
            meta: JSON.stringify(this.getSaveData()),
            otherNightOrder:otherNightOrderSaveData,
            previewOnToken:this.previewOnToken.get(),
            processed_images:{},
            roles:{},
            src_images:{}
        };
    };

    /** get overview for binding */
    getOverviewProperty():BloodBind.Property<string> {
        return this.meta.getOverviewProperty();
    }

    /** get synopsis for binding */
    getSynopsisProperty():BloodBind.Property<string> {
        return this.meta.getSynopsisProperty();
    }

    /**
     * set to opened file
     * @param data 
     */
     open(_saveName:string, _data:CustomEditionSaveData):boolean {
        throw new Error("Not yet implemented");
        return true;
    }
}

/** observable properties for a custom edition */
export const CustomEdition = ObservableObjectMixin(_CustomEdition);
export type CustomEditionType = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _CustomEdition;