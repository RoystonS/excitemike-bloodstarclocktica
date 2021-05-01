/**
 * Model for character almanac data
 * @module CharacterAlmanac
 */

import {Property} from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

/** data to persist on the server for a character's almanac entry */
export type CharacterAlmanacSaveData = {
    examples: string;
    flavor: string;
    howToRun: string;
    overview: string;
    tip: string;
};

export class CharacterAlmanac extends ObservableObject {
    @observableProperty
    private examples = new Property('');
    
    @observableProperty
    private flavor = new Property('');
    
    @observableProperty
    private howToRun = new Property('');
    
    @observableProperty
    private overview = new Property('');
    
    @observableProperty
    private tip = new Property('');

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

    getTip():string{return this.tip.get();}
    getTipProperty():Property<string> {return this.tip;}

    /** load in save data */
    open(data:CharacterAlmanacSaveData):void {
        if (!data) {this.reset(); return;}
        this.flavor.set(data.flavor);
        this.overview.set(data.overview);
        this.examples.set(data.examples);
        this.howToRun.set(data.howToRun);
        this.tip.set(data.tip);
    }
}
