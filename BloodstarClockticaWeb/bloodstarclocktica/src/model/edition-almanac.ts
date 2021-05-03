/**
 * Model for edition almanac data
 * @module EditionAlmanac
 */
import {Property} from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class EditionAlmanac extends ObservableObject<EditionAlmanac> {
    @observableProperty
    private synopsis = new Property<string>('');
    @observableProperty
    private overview = new Property<string>('');

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
}
