/**
 * Base definitions from which bindings are built
 * 
 * @module BaseBinding
 */

export type PropertyChangeListener<T> = (value:T)=>Promise<void>|void;

/** generic observable property */
export class Property<T> {
    private defaultValue:T;//TODO: I think this should now be tracked elsewhere
    private value:T;
    private listeners:PropertyChangeListener<T>[];

    constructor(value:T) {
        this.defaultValue = value;
        this.value = value;
        this.listeners = [];
    }
    async set(value:T):Promise<void> {
        if (this.value !== value) {
            this.value = value;
            await this.notifyListeners();
        }
    }
    get():T {
        return this.value;
    }
    addListener(cb:PropertyChangeListener<T>):void {
        this.listeners.push(cb);
    }
    getDefault():T {return this.defaultValue;}
    isDefault():boolean { return this.value === this.defaultValue; }
    removeListener(cb:PropertyChangeListener<T>):void {
        this.listeners = this.listeners.filter(i=>i!==cb);
    }
    removeAllListeners():void {
        this.listeners = [];
    }
    async reset():Promise<void> {
        this.set(this.defaultValue);
    }
    private async notifyListeners():Promise<void> {
        return (await Promise.all(this.listeners.map(cb=>cb(this.value))))[0];
    }
}

export type SyncFromElementToPropertyFn = ((_:Event)=>void)|null;
export type SyncFromPropertyToElementFn<ValueType> = ((v:ValueType)=>void) | null;

/** shared code between binding classes */
export class BaseBinding<ValueType> {
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
    destroy():void {
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