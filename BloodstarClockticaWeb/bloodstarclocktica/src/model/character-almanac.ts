/**
 * Model for character almanac data
 * @module CharacterAlmanac
 */

import {Property} from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class CharacterAlmanac extends ObservableObject<CharacterAlmanac> {
    @observableProperty
    private examples = new Property<string>('');
    
    @observableProperty
    private flavor = new Property<string>('');
    
    @observableProperty
    private howToRun = new Property<string>('');
    
    @observableProperty
    private overview = new Property<string>('');
    
    @observableProperty
    private tip = new Property<string>('');

    constructor() {
        super();
        this.init();
    }

    getExamples():string{return this.examples.get();}
    getExamplesProperty():Property<string> {return this.examples;}
    getFlavor():string{return this.flavor.get();}
    getFlavorProperty():Property<string> {return this.flavor;}
    getHowToRun():string{return this.howToRun.get();}
    getHowToRunProperty():Property<string> {return this.howToRun;}
    getOverview():string{return this.overview.get();}
    getOverviewProperty():Property<string> {return this.overview;}

    getTip():string{return this.tip.get();}
    getTipProperty():Property<string> {return this.tip;}
}
