/**
 * Model for character data
 * @module Character
 */
import {CharacterAlmanac, CharacterAlmanacSaveData} from './character-almanac';
import {EnumProperty, Property} from '../bind/bindings';
import {observableChild, ObservableObject, observableProperty} from '../bind/observable-object';
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

export class Character extends ObservableObject {
    @observableProperty
    private ability = new Property('');

    @observableProperty
    private attribution = new Property('');
    
    @observableChild
    private almanac = new CharacterAlmanac();
    
    @observableProperty
    private characterReminderTokens = new Property('');
    
    @observableProperty
    private export = new Property(true);

    @observableProperty
    private firstNightOrdinal = new Property('-');
    
    @observableProperty
    private firstNightReminder = new Property('');
    
    @observableProperty
    private globalReminderTokens = new Property('');
    
    @observableProperty
    private id = new Property('newcharacter');
    
    @observableProperty
    private name = new Property('New Character');

    @observableProperty
    private otherNightOrdinal = new Property('-');
    
    @observableProperty
    private otherNightReminder = new Property('');
    
    @observableProperty
    private setup = new Property(false);
    
    @observableProperty
    private styledImage = new Property<string|null>(null);
    
    @observableProperty
    private team = new EnumProperty<string>(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS);
    
    @observableProperty
    private unStyledImage = new Property<string|null>(null);
    // TODO: image settings
    // TODO: tie image settings to lazily re-generating styledImage

    constructor() {
        super();
        this.init();
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
    getFirstNightOrdinalProperty():Property<string>{return this.firstNightOrdinal;}
    getFirstNightReminder():string{return this.firstNightReminder.get();}
    getFirstNightReminderProperty():Property<string>{return this.firstNightReminder;}
    getGlobalReminderTokens():ReadonlyArray<string> { return splitLines(this.globalReminderTokens.get()); }
    getGlobalReminderTokensProperty():Property<string> { return this.globalReminderTokens; }
    getId():string { return this.id.get(); }
    getIdProperty():Property<string>{return this.id;}
    getName():string{return this.name.get();}
    getNameProperty():Property<string>{return this.name;}
    getOtherNightOrdinalProperty():Property<string>{return this.otherNightOrdinal;}
    getOtherNightReminder():string{return this.otherNightReminder.get();}
    getOtherNightReminderProperty():Property<string>{return this.otherNightReminder;}

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
        this.firstNightReminder.set(data.firstNightReminder);
        this.globalReminderTokens.set(data.globalReminderTokens.join('\n'));
        this.id.set(data.id);
        this.name.set(data.name);
        this.otherNightReminder.set(data.otherNightReminder);
        this.setup.set(data.setup);
        this.styledImage.set(data.styledImage);
        this.team.set(data.team);
        this.unStyledImage.set(data.unStyledImage);
    }

    setId(value:string):void { this.id.set(value); }
    setName(value:string):void{this.name.set(value);}
    setUnStyledImage(v:string|null):void {this.unStyledImage.set(v);}
}
