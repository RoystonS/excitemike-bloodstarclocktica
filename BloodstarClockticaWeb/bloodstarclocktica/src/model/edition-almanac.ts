/**
 * Model for edition almanac data
 * @module EditionAlmanac
 */
import {Property} from '../bind/bindings';
import {ObservableObject, observableProperty} from '../bind/observable-object';

export class EditionAlmanac extends ObservableObject<EditionAlmanac> {
    @observableProperty()
    readonly synopsis = new Property<string>('');
    @observableProperty()
    readonly overview = new Property<string>('');

    constructor() {
        super();
        this.init();
    }
}
