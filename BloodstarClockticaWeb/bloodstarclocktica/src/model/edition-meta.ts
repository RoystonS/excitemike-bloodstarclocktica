/**
 * Model for edition metadata
 * @module EditionMeta
 */
 import {Property} from '../bind/bindings';
 import {ObservableObject, observableProperty} from '../bind/observable-object';

export class EditionMeta extends ObservableObject<EditionMeta> {
    /** who to credit for the edition */
    @observableProperty
    readonly author = new Property<string>('');

    /** logo image for the edition */
    @observableProperty
    readonly logo = new Property<string|null>(null);

    /** what the edition is called */
    @observableProperty
    readonly name = new Property<string>('New Edition');

    constructor() {
        super();
        this.init();
    }
}
