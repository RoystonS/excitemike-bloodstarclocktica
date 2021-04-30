/**
 * Model for edition almanac data
 * @module EditionAlmanac
 */
import {Property} from '../bind/bindings';
import {ObservableObjectMixin} from '../bind/observable-object';

/** data to persist on the server for the meta almanac portion of edition */
export type EditionAlmanacSaveData = {
    synopsis: string,
    overview: string,
};

class _EditionAlmanac {
    private synopsis: Property<string>;
    private overview: Property<string>;

    constructor() {
        this.synopsis = new Property('');
        this.overview = new Property('');
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
        this.synopsis.set(data.synopsis);
        this.overview.set(data.overview);
    }

    /** reset to default */
    reset() {
        this.synopsis.set('');
        this.overview.set('');
    }
}

/** observable properties about the character */
export const EditionAlmanac = ObservableObjectMixin(_EditionAlmanac);
/** observable properties about the edition */
export type EditionAlmanac = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _EditionAlmanac;
