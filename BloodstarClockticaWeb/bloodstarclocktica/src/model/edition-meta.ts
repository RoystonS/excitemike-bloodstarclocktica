/**
 * Model for edition metadata
 * @module EditionMeta
 */
 import {Property} from '../bind/bindings';
 import {ObservableObjectMixin} from '../bind/observable-object';

/** data to persist on the server for the meta portion of custom edition */
export type EditionMetaSaveData = {
    author: string,
    logo: string|null
    name: string,
};
class _EditionMeta {
    private author: Property<string>;
    private logo: Property<string|null>;
    private name: Property<string>;
    constructor() {
        this.author = new Property('');
        this.logo = new Property<string|null>(null);
        this.name = new Property('New Edition');
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
        if (!data) {this.reset(''); return;}
        this.name.set(data.name);
        this.author.set(data.author);
        this.logo.set(data.logo);
    }
    
    /** set to default */
    reset(name:string) {
        this.author.set('');
        this.logo.set(null);
        this.name.set(name);
    }
}

/** observable properties about the edition */
export const EditionMeta = ObservableObjectMixin(_EditionMeta);

/** observable properties about the edition */
export type EditionMeta = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _EditionMeta;