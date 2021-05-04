/**
 * Base definitions from which bindings are built
 * 
 * @module BaseBinding
 */

export type FieldType = null|boolean|number|string|FieldType[]|{[key:string]:FieldType};
export type PropertyChangeListener<T> = (value:T)=>void;

/** generic observable property */
export class Property<T/* extends FieldType*/> {
    private defaultValue:T;
    private value:T;
    private listeners:PropertyChangeListener<T>[];

    constructor(value:T) {
        this.defaultValue = value;
        this.value = value;
        this.listeners = [];
    }
    set(value:T) {
        if (this.value !== value) {
            this.value = value;
            this.notifyListeners();
        }
    }
    get() {
        return this.value;
    }
    addListener(cb:PropertyChangeListener<T>) {
        this.listeners.push(cb);
    }
    getDefault():T {return this.defaultValue;}
    isDefault():boolean { return this.value === this.defaultValue; }
    removeListener(cb:PropertyChangeListener<T>) {
        this.listeners = this.listeners.filter(i=>i!==cb);
    }
    removeAllListeners() {
        this.listeners = [];
    }
    reset():void {
        this.set(this.defaultValue);
    }
    private notifyListeners() {
        const backup = this.listeners.concat();
        backup.forEach(cb=>cb(this.value));
    }
}

export type SyncFromElementToPropertyFn = ((_:Event)=>void)|null;
export type SyncFromPropertyToElementFn<ValueType> = ((v:ValueType)=>void) | null;

/** shared code between binding classes */
export class BaseBinding<ValueType extends FieldType> {
    private htmlElement:HTMLElement|null;
    private property:Property<ValueType>|null;
    private eventName:string;
    private syncFromElementToProperty:SyncFromElementToPropertyFn;
    private syncFromPropertyToElement:SyncFromPropertyToElementFn<ValueType>;

    /** set up the binding and bookkeeping for cleanup */
    constructor(node:Node, property:Property<ValueType>, eventName:string, syncFromElementToProperty:SyncFromElementToPropertyFn, syncFromPropertyToElement:SyncFromPropertyToElementFn<ValueType>) {
        this.htmlElement = (node instanceof HTMLElement) ? node : null;
        this.property = property;
        this.eventName = eventName;

        this.syncFromElementToProperty = syncFromElementToProperty;
        this.syncFromPropertyToElement = syncFromPropertyToElement;

        if (syncFromPropertyToElement) { syncFromPropertyToElement(property.get()); }

        if (this.htmlElement && syncFromElementToProperty) {
            this.htmlElement.addEventListener(eventName, syncFromElementToProperty);
        }
        if (syncFromPropertyToElement) {
            property.addListener(syncFromPropertyToElement);
        }
    }

    /** clean up */
    destroy() {
        if (this.htmlElement && this.syncFromElementToProperty) {
            this.htmlElement.removeEventListener(this.eventName, this.syncFromElementToProperty);
            this.syncFromElementToProperty = null;
        }
        if (this.syncFromPropertyToElement) {
            this.property?.removeListener(this.syncFromPropertyToElement);
            this.syncFromPropertyToElement = null;
        }
        this.htmlElement = null;
        this.property = null;
    }

    protected getProperty():Property<ValueType>|null {
        return this.property;
    }
}