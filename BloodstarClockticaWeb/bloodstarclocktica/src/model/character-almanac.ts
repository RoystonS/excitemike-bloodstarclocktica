/**
 * Model for character almanac data
 * @module CharacterAlmanac
 */

import {Property} from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class CharacterAlmanac extends ObservableObject<CharacterAlmanac> {
    @observableProperty()
    readonly examples = new Property<string>('');
    
    @observableProperty()
    readonly flavor = new Property<string>('');
    
    @observableProperty()
    readonly howToRun = new Property<string>('');
    
    @observableProperty()
    readonly overview = new Property<string>('');
    
    @observableProperty()
    readonly tip = new Property<string>('');

    constructor() {
        super();
        this.init();
    }
}
