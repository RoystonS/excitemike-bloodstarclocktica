/**
 * Model for character data
 * @module Character
 */
import {CharacterAlmanac} from './character-almanac';
import {EnumProperty, Property} from '../bind/bindings';
import {observableChild, ObservableObject, observableProperty} from '../bind/observable-object';
import {BLOODTEAM_OPTIONS, BloodTeam} from '../model/blood-team';
import {CharacterImageSettings} from '../model/character-image-settings';

export class Character extends ObservableObject<Character> {
    @observableProperty
    readonly ability = new Property<string>('');

    @observableProperty
    readonly attribution = new Property<string>('');
    
    @observableChild
    readonly almanac = new CharacterAlmanac();
    
    @observableProperty
    readonly characterReminderTokens = new Property<string>('');
    
    @observableProperty
    readonly export = new Property<boolean>(true);

    @observableProperty
    readonly firstNightOrdinal = new Property<string>('-');
    
    @observableProperty
    readonly firstNightReminder = new Property<string>('');
    
    @observableProperty
    readonly globalReminderTokens = new Property<string>('');
    
    @observableProperty
    readonly id = new Property<string>('newcharacter');
    
    @observableChild
    readonly imageSettings = new CharacterImageSettings();

    @observableProperty
    readonly name = new Property<string>('New Character');

    @observableProperty
    readonly otherNightOrdinal = new Property<string>('-');
    
    @observableProperty
    readonly otherNightReminder = new Property<string>('');
    
    @observableProperty
    readonly setup = new Property<boolean>(false);
    
    @observableProperty
    readonly styledImage = new Property<string|null>(null);
    
    @observableProperty
    readonly team = new EnumProperty<BloodTeam>(BloodTeam.TOWNSFOLK, BLOODTEAM_OPTIONS);
    
    @observableProperty
    readonly unStyledImage = new Property<string|null>(null);
    
    // TODO: tie image settings to lazily re-generating styledImage

    constructor() {
        super();
        this.init();
    }
}
