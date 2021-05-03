/**
 * Model for edition metadata
 * @module EditionMeta
 */
 import {Property} from '../bind/bindings';
 import {ObservableObject, observableProperty} from '../bind/observable-object';

export class EditionMeta extends ObservableObject<EditionMeta> {
    /** who to credit for the edition */
    @observableProperty
    private author = new Property<string>('');

    /** logo image for the edition */
    @observableProperty
    private logo = new Property<string|null>(null);

    /** what the edition is called */
    @observableProperty
    private name = new Property<string>('New Edition');

    constructor() {
        super();
        this.init();
    }

    getAuthorProperty():Property<string> { return this.author; }
    getLogoProperty():Property<string|null> { return this.logo; }
    getName():string { return this.name.get(); }
    getNameProperty():Property<string> { return this.name; }
}
