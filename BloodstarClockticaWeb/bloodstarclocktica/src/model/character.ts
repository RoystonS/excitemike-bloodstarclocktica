/**
 * Model for character data
 * @module Character
 */
import {CharacterAlmanac, CharacterAlmanacSaveData} from './character-almanac';
import {EnumProperty, Property} from '../bind/bindings';
import {ObservableObjectMixin} from '../bind/observable-object';
import {BLOODTEAM_OPTIONS, BloodTeam, parseBloodTeam} from '../model/blood-team';

const splitLines = (str:string) => str.split(/\r?\n/);

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

class _Character {
    private ability: Property<string>;
    private attribution: Property<string>;
    private almanac: CharacterAlmanac;
    private characterReminderTokens: Property<string>;
    private export: Property<boolean>;
    private firstNightReminderProperty: Property<string>;
    private globalReminderTokens: Property<string>;
    private id: Property<string>;
    private name: Property<string>;
    private otherNightReminderProperty: Property<string>;
    private setup: Property<boolean>;
    private styledImage: Property<string|null>;
    private team: EnumProperty<string>;
    private unStyledImage: Property<string|null>;
    constructor() {
        this.ability = new Property('');
        this.attribution = new Property('');
        this.almanac = new CharacterAlmanac();
        this.characterReminderTokens = new Property<string>('');
        this.export = new Property<boolean>(true);
        this.firstNightReminderProperty = new Property('');
        this.globalReminderTokens = new Property<string>('');
        this.id = new Property('newcharacter');
        this.name = new Property('New Character');
        this.otherNightReminderProperty = new Property('');
        this.setup = new Property<boolean>(false);
        this.styledImage = new Property<string|null>(null);
        this.team = new EnumProperty<string>(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS);
        this.unStyledImage = new Property<string|null>(null);

        // TODO: image settings
        // TODO: tie image settings to lazily re-generating styledImage
    }

    /** create from save data */
    static from(data:CharacterSaveData):Character {
        const character = new Character();
        character.open(data);
        return character;
    }

    getAbility():string{return this.ability.get();}
    getAbilityProperty():Property<string>{return this.ability;}
    getAttribution():string{return this.attribution.get();}
    getAttributionProperty():Property<string>{return this.attribution;}
    getAlmanac():CharacterAlmanac { return this.almanac; }
    getAlmanacSaveData():CharacterAlmanacSaveData { return this.almanac.getSaveData(); }
    getCharacterReminderTokens():ReadonlyArray<string> { return splitLines(this.characterReminderTokens.get()); }
    getCharacterReminderTokensProperty():Property<string> { return this.characterReminderTokens; }
    getExport():boolean{return this.export.get();}
    getExportProperty():Property<boolean>{return this.export;}
    getFirstNightReminder():string{return this.firstNightReminderProperty.get();}
    getFirstNightReminderProperty():Property<string>{return this.firstNightReminderProperty;}
    getGlobalReminderTokens():ReadonlyArray<string> { return splitLines(this.globalReminderTokens.get()); }
    getGlobalReminderTokensProperty():Property<string> { return this.globalReminderTokens; }
    getId():string { return this.id.get(); }
    getIdProperty():Property<string>{return this.id;}
    getName():string{return this.name.get();}
    getNameProperty():Property<string>{return this.name;}
    getOtherNightReminder():string{return this.otherNightReminderProperty.get();}
    getOtherNightReminderProperty():Property<string>{return this.otherNightReminderProperty;}

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
    getSetupProperty():Property<boolean>{return this.setup;}
    getStyledImage():string|null{return this.styledImage.get();}
    getStyledImageProperty():Property<string|null>{return this.styledImage;}
    getTeam():BloodTeam{return parseBloodTeam(this.team.get());}
    getTeamProperty():EnumProperty<string>{return this.team;}
    getUnStyledImage():string|null{return this.unStyledImage.get();}
    getUnStyledImageProperty():Property<string|null>{return this.unStyledImage;}

    /** load in save data */
    open(data:CharacterSaveData):void {
        if (!data) {this.reset(); return;}
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

    /** reset to default */
    reset():void {
        this.ability.set('');
        this.attribution.set('');
        this.almanac.reset();
        this.characterReminderTokens.set('');
        this.export.set(true);
        this.firstNightReminderProperty.set('');
        this.globalReminderTokens.set('');
        this.id.set('newcharacter');
        this.name.set('New Character');
        this.otherNightReminderProperty.set('');
        this.setup.set(false);
        this.styledImage.set(null);
        this.team.set(BloodTeam.TOWNSFOLK);
        this.unStyledImage.set(null);
    }

    setId(value:string):void { this.id.set(value); }
    setName(value:string):void{this.name.set(value);}
    setUnStyledImage(v:string|null):void {this.unStyledImage.set(v);}
}
/** observable properties about the character */
export const Character = ObservableObjectMixin(_Character);
/** observable properties about the edition */
export type Character = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _Character;
