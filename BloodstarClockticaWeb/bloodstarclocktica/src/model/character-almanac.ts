/**
 * Model for character almanac data
 * @module CharacterAlmanac
 */

import {Property} from '../bind/bindings';
import {ObservableObjectMixin} from '../bind/observable-object';

/** data to persist on the server for a character's almanac entry */
export type CharacterAlmanacSaveData = {
    examples: string;
    flavor: string;
    howToRun: string;
    overview: string;
    tip: string;
};

class _CharacterAlmanac {
    private examples: Property<string>;
    private flavor: Property<string>;
    private howToRun: Property<string>;
    private overview: Property<string>;
    private tip: Property<string>;

    constructor() {
        this.examples = new Property<string>('');
        this.flavor = new Property<string>('');
        this.howToRun = new Property<string>('');
        this.overview = new Property<string>('');
        this.tip = new Property<string>('');
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
