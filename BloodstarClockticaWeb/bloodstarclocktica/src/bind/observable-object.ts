import { Property } from "./bindings";
import { ObservableCollection } from "./observable-collection";
import { showError } from '../dlg/blood-message-dlg';

export type PropKey = string|symbol;
export type PropertyChangedListener = (propName:PropKey) => void;

function noSuchProperty(object:any, key:string|symbol):never { const e = new Error(`no property '${String(key)}' on object (${object.constructor.name})`); showError(e); throw e; }

/** decorator to make the ObservableObject manage the child observable */
export const observableChild:PropertyDecorator = (target:any, propertyKey:PropKey):void => {
    target._queueInitChild(propertyKey);
};

/** decorator to make the ObservableObject manage the collection */
export const observableCollection:PropertyDecorator = (target:any, propertyKey:PropKey):void => {
    target._queueInitCollection(propertyKey);
};

/** decorator to make the ObservableObject manage the property */
export const observableProperty:PropertyDecorator = (target:any, propertyKey:PropKey):void => {
    if (!(target instanceof ObservableObject)){return;}
    target._queueInitProperty(propertyKey);
};

/** extend this to advertise your properties and changes to them */
export abstract class ObservableObject {
    private ___queuedChildInit:PropKey[]|undefined;
    private ___queuedCollectionInit:PropKey[]|undefined;
    private ___queuedPropInit:PropKey[]|undefined;
    private collections = new Map<PropKey, ObservableCollection<any>>();
    private observableChildren = new Map<PropKey, ObservableObject>();
    private properties = new Map<PropKey, Property<any>>();
    private propertyChangedListeners:PropertyChangedListener[] = [];

    /** trigger a reminder if a developer forgets to make the subclass call init */
    constructor() {
        setTimeout(()=>{this.initCheck()}, 1);
    }

    /** base class must call this (recommmended in constructor) in order for property changed event to work */
    protected init():void {
        if (this.___queuedPropInit) {
            for (const key of this.___queuedPropInit) {
                const property = (this as any)[key];
                if (!(property instanceof Property)) { throw new Error(`It looks like the "observableProperty" decorator was used on non-Property field "${String(key)}" of class "${this.constructor.name}"!`); }
                this.properties.set(key, property);
                property.addListener(_=>this.notifyPropertyChangedEventListeners(key));
            }
            this.___queuedPropInit = undefined;
        }
        if (this.___queuedCollectionInit) {
            for (const key of this.___queuedCollectionInit) {
                const collection = (this as any)[key];
                if (!(collection instanceof ObservableCollection)) { throw new Error(`It looks like the "observableCollection" decorator was used on non-ObservableCollection field "${String(key)}" of class "${this.constructor.name}"!`); }
                this.collections.set(key, collection);
                collection.addCollectionChangedListener(_=>this.notifyPropertyChangedEventListeners(key));
                // TODO: should changes in list items percolate up?
            }
            this.___queuedCollectionInit = undefined;
        }
        if (this.___queuedChildInit) {
            for (const key of this.___queuedChildInit) {
                const child = (this as any)[key];
                if (!(child instanceof ObservableObject)) { throw new Error(`It looks like the "observableChild" decorator was used on non-ObservableObject field "${String(key)}" of class "${this.constructor.name}"!`); }
                this.observableChildren.set(key, child);
                child.addPropertyChangedEventListener(_=>this.notifyPropertyChangedEventListeners(key));
            }
            this.___queuedChildInit = undefined;
        }
    }

    /** if it doesn't look like init was called, throw an error */
    initCheck():void|never {
        if (this.___queuedChildInit || this.___queuedCollectionInit || this.___queuedPropInit) {
            const error = new Error(`It appears a developer forgot to call init() after super() when ${this.constructor.name} extended ObservableObject!`);
            showError(error);
            throw error;
        };
    }

    /** register for updates when a property changes */
    addPropertyChangedEventListener(listener:PropertyChangedListener):void {
        this.propertyChangedListeners.push(listener);
    }

    /** retrieve a child observable by name */
    getChild(key:PropKey):ObservableObject {
        return this.observableChildren.get(key) || noSuchProperty(this, key);
    }

    /** retrieve a collection property by name */
    getCollection(key:PropKey):ObservableCollection<any> {
        return this.collections.get(key) || noSuchProperty(this, key);
    }

    /** retrieve a property by name */
    getProperty(key:PropKey):Property<any> {
        return this.properties.get(key) || noSuchProperty(this, key);
    }

    /** retrieve a property value by name */
    getPropertyValue(propName:string):any {
        return this.getProperty(propName)?.get();
    }

    /** called by decorator to schedule work in constructor */
    _queueInitChild(key:PropKey):void {
        if (!this.___queuedChildInit) {this.___queuedChildInit=[];}
        this.___queuedChildInit.push(key);
    }

    /** called by decorator */
    _queueInitCollection(key:PropKey): void {
        if (!this.___queuedCollectionInit) {this.___queuedCollectionInit=[];}
        this.___queuedCollectionInit.push(key);
    }

    /** called by decorator */
    _queueInitProperty(key:PropKey):void {
        if (!this.___queuedPropInit) {this.___queuedPropInit=[];}
        this.___queuedPropInit.push(key);
    }

    /** send out notificaiton of a property changing */
    notifyPropertyChangedEventListeners(propName:PropKey):void {
        const backup = this.propertyChangedListeners.concat();
        backup.forEach(cb=>cb(propName));
    }

    /** unregister for updates when a property changes */
    removePropertyChangedEventListener(listener:PropertyChangedListener):void {
        this.propertyChangedListeners = this.propertyChangedListeners.filter(i=>i!==listener);
    }

    /** reset all properties to default values */
    reset():void {
        for (const child of this.observableChildren.values()) {
            child.reset();
        }
        for (const collection of this.collections.values()) {
            collection.clear();
        }
        for (const property of this.properties.values()) {
            property.reset();
        }
    }

    /** set a property value by name */
    setPropertyValue(propName:string, value:any):void {
        this.getProperty(propName)?.set(value);
    }
}
