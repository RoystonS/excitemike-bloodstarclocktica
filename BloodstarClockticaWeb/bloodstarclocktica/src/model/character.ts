/**
 * Model for character data
 * @module Character
 */
import {CharacterAlmanac} from './character-almanac';
import {EnumProperty, Property} from '../bind/bindings';
import {observableChild, ObservableObject, observableProperty} from '../bind/observable-object';
import {BLOODTEAM_OPTIONS, BloodTeam, parseBloodTeam} from '../model/blood-team';
import {CharacterImageSettings} from '../model/character-image-settings';

const splitLines = (str:string) => str.split(/\r?\n/);

export class Character extends ObservableObject<Character> {
    @observableProperty
    ability = new Property<string>('');

    @observableProperty
    attribution = new Property<string>('');
    
    @observableChild
    almanac = new CharacterAlmanac();
    
    @observableProperty
    characterReminderTokens = new Property<string>('');
    
    @observableProperty
    export = new Property<boolean>(true);

    @observableProperty
    firstNightOrdinal = new Property<string>('-');
    
    @observableProperty
    firstNightReminder = new Property<string>('');
    
    @observableProperty
    globalReminderTokens = new Property<string>('');
    
    @observableProperty
    id = new Property<string>('newcharacter');
    
    @observableChild
    imageSettings = new CharacterImageSettings();

    @observableProperty
    name = new Property<string>('New Character');

    @observableProperty
    otherNightOrdinal = new Property<string>('-');
    
    @observableProperty
    otherNightReminder = new Property<string>('');
    
    @observableProperty
    setup = new Property<boolean>(false);
    
    @observableProperty
    styledImage = new Property<string|null>(null);
    
    @observableProperty
    team = new EnumProperty<BloodTeam>(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS);
    
    @observableProperty
    unStyledImage = new Property<string|null>(null);
    
    // TODO: tie image settings to lazily re-generating styledImage

    constructor() {
        super();
        this.init();
    }

    getAbility():string{return this.ability.get();}
    getAbilityProperty():Property<string>{return this.ability;}
    getAttribution():string{return this.attribution.get();}
    getAttributionProperty():Property<string>{return this.attribution;}
    getAlmanac():CharacterAlmanac { return this.almanac; }
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
    getImageStyleSettings():CharacterImageSettings {return this.imageSettings;}
    getName():string{return this.name.get();}
    getNameProperty():Property<string>{return this.name;}
    getOtherNightOrdinalProperty():Property<string>{return this.otherNightOrdinal;}
    getOtherNightReminder():string{return this.otherNightReminder.get();}
    getOtherNightReminderProperty():Property<string>{return this.otherNightReminder;}
    getSetup():boolean{return this.setup.get();}
    getSetupProperty():Property<boolean>{return this.setup;}
    getStyledImage():string|null{return this.styledImage.get();}
    getStyledImageProperty():Property<string|null>{return this.styledImage;}
    getTeam():BloodTeam{return parseBloodTeam(this.team.get());}
    getTeamProperty():EnumProperty<BloodTeam>{return this.team;}
    getUnStyledImage():string|null{return this.unStyledImage.get();}
    getUnStyledImageProperty():Property<string|null>{return this.unStyledImage;}

    setId(value:string):void { this.id.set(value); }
    setName(value:string):void{this.name.set(value);}
    setUnStyledImage(v:string|null):void {this.unStyledImage.set(v);}
}
