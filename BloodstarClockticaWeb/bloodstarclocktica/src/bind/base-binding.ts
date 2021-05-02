/**
 * Base definitions from which bindings are built
 * 
 * @module BaseBinding
 */

export type PropertyChangeListener<T> = (value:T)=>void;

/** generic observable property */
export class Property<T> {
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
export class BaseBinding<ValueType> {
    private element:HTMLElement|null;
    private property:Property<ValueType>|null;
    private eventName:string;
    private syncFromElementToProperty:SyncFromElementToPropertyFn;
    private syncFromPropertyToElement:SyncFromPropertyToElementFn<ValueType>;

    /** set up the binding and bookkeeping for cleanup */
    constructor(element:HTMLElement, property:Property<ValueType>, eventName:string, syncFromElementToProperty:SyncFromElementToPropertyFn, syncFromPropertyToElement:SyncFromPropertyToElementFn<ValueType>) {
        this.element = element;
        this.property = property;
        this.eventName = eventName;

        this.syncFromElementToProperty = syncFromElementToProperty;
        this.syncFromPropertyToElement = syncFromPropertyToElement;

        if (syncFromPropertyToElement) { syncFromPropertyToElement(property.get()); }

        if (syncFromElementToProperty) {
            element.addEventListener(eventName, syncFromElementToProperty);
        }
        if (syncFromPropertyToElement) {
            property.addListener(syncFromPropertyToElement);
        }
    }

    /** clean up */
    destroy() {
        if (this.syncFromElementToProperty !== null) {
            this.element?.removeEventListener(this.eventName, this.syncFromElementToProperty);
            this.syncFromElementToProperty = null;
        }
        if (this.syncFromPropertyToElement !== null) {
            this.property?.removeListener(this.syncFromPropertyToElement);
            this.syncFromPropertyToElement = null;
        }
        this.element = null;
        this.property = null;
    }

    protected getProperty():Property<ValueType>|null {
        return this.property;
    }
}