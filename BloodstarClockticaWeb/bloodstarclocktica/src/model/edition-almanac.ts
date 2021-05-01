/**
 * Model for edition almanac data
 * @module EditionAlmanac
 */
import {Property} from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

/** data to persist on the server for the meta almanac portion of edition */
export type EditionAlmanacSaveData = {
    synopsis: string,
    overview: string,
};

export class EditionAlmanac extends ObservableObject {
    @observableProperty
    private synopsis = new Property('');
    @observableProperty
    private overview = new Property('');

    constructor() {
        super();
        this.init();
    }

    /** get overview for binding */
    getOverviewProperty():Property<string> {
        return this.overview;
    }

    /** get synopsis for binding */
    getSynopsisProperty():Property<string> {
        return this.synopsis;
    }

    /** get representation to be stored on server */
    getSaveData():EditionAlmanacSaveData {
        return {
            synopsis: this.synopsis.get(),
            overview: this.overview.get(),
        };
    }

    /** set based on save data */
    open(data:EditionAlmanacSaveData):void {
        if (!data) {this.reset(); return;}
        this.synopsis.set(data.synopsis);
        this.overview.set(data.overview);
    }
}
