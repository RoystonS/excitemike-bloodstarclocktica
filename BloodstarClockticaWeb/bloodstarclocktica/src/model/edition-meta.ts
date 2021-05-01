/**
 * Model for edition metadata
 * @module EditionMeta
 */
 import {Property} from '../bind/bindings';
 import {ObservableObject, observableProperty} from '../bind/observable-object';

/** data to persist on the server for the meta portion of custom edition */
export type EditionMetaSaveData = {
    author: string,
    logo: string|null
    name: string,
};
export class EditionMeta extends ObservableObject {
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

    /** get data to store */
    getSaveData() {
        return {
            name: this.name.get(),
            author: this.author.get(),
            logo: this.logo.get()
        };
    }

    /** set based on save data */
    open(data:EditionMetaSaveData):void {
        if (!data) {this.reset(); return;}
        this.name.set(data.name);
        this.author.set(data.author);
        this.logo.set(data.logo);
    }
}
