/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldType, Property } from "./bindings";
import { ObservableCollection } from "./observable-collection";
import { showError } from '../dlg/blood-message-dlg';

export type Serializability = 'both'|'readonly'|'writeonly'|'neither';
export type ObservableType = ObservableCollection<any>|ObservableObject<any>|Property<FieldType>;
export type PropKey<T> = keyof T;
export type PropertyChangedListener<T> = (propName:PropKey<T>) => void;
export type CustomSerializeFn = (object:ObservableObject<any>, field:ObservableType)=>FieldType;
export type CustomDeserializeFn = (object:ObservableObject<any>, field:ObservableType, data:FieldType)=>Promise<void>;
type CustomSerializeTable<T> = Map<keyof T, {s:CustomSerializeFn,d:CustomDeserializeFn}>;
function makeCustomSerializeTable<T>():CustomSerializeTable<T> {
    return new Map<keyof T, {s:CustomSerializeFn,d:CustomDeserializeFn}>();
}

function noSuchProperty<T>(object:any, key:PropKey<T>):never {
    const message = `no property '${String(key)}' on object (${object.constructor.name})`;
    const error = new Error(message);
    console.error('Error', message, error);
    throw error;
}

/** decorator to customize serialization and deserialization for a field */
export function customSerialize(
    serializeFn:CustomSerializeFn,
    deserializeFn:CustomDeserializeFn
):PropertyDecorator {
    return (target:any, propertyKey:string|symbol):void => {
        if (!(target instanceof ObservableObject)){return;}
        target._setCustomSerialize(propertyKey, serializeFn, deserializeFn);
    };
}

/** decorator to make the ObservableObject manage the child observable */
export function observableChild(serializable:Serializability = 'both'):PropertyDecorator {
    return (target:any, propertyKey:string|symbol):void => {
        if (!(target instanceof ObservableObject)){return;}
        target._queueInitChild(propertyKey, serializable);
    };
}

/** decorator to make the ObservableObject manage the collection */
export function observableCollection(serializable:Serializability = 'both'):PropertyDecorator {
    return (target:any, propertyKey:string|symbol):void => {
        if (!(target instanceof ObservableObject)){return;}
        target._queueInitCollection(propertyKey, serializable);
    };
}

/** decorator to make the ObservableObject manage the property */
export function observableProperty(serializable:Serializability = 'both'):PropertyDecorator {
    return (target:any, propertyKey:string|symbol):void => {
        if (!(target instanceof ObservableObject)){return;}
        target._queueInitProperty(propertyKey, serializable);
    };
}

/** extend this to advertise your properties and changes to them */
export abstract class ObservableObject<T> {
    private ___queuedChildInit?:PropKey<T>[];
    private ___queuedCollectionInit?:PropKey<T>[];
    private ___queuedPropInit?:PropKey<T>[];
    private collections = new Map<keyof T, ObservableCollection<any>>();
    private customSerializeTable?:Map<keyof T, {s:CustomSerializeFn,d:CustomDeserializeFn}>;
    private observableChildren = new Map<keyof T, ObservableObject<any>>();
    private properties = new Map<keyof T, Property<FieldType>>();
    private propertyChangedListeners:PropertyChangedListener<T>[] = [];
    private undeserializableFields?:Set<PropKey<T>>;
    private unserializableFields?:Set<PropKey<T>>;

    /** trigger a reminder if a developer forgets to make the subclass call init */
    constructor() {
        setTimeout(()=>{this.initCheck()}, 1);
    }

    /** update sets for fields to not read/write */
    _trackSerializability(key:PropKey<T>, serializability:Serializability):void {
        switch (serializability) {
            case 'neither':
            case 'readonly':
                if (!this.unserializableFields) {this.unserializableFields=new Set<PropKey<T>>();}
                this.unserializableFields.add(key);
                break;
        }
        switch (serializability) {
            case 'neither':
            case 'writeonly':
                if (!this.undeserializableFields) {this.undeserializableFields=new Set<PropKey<T>>();}
                this.undeserializableFields.add(key);
                break;
        }
    }

    /** called by decorator to schedule work in constructor */
    _queueInitChild(key:PropKey<T>, serializability:Serializability):void {
        if (!this.___queuedChildInit) {this.___queuedChildInit=[];}
        this._trackSerializability(key, serializability);
        this.___queuedChildInit.push(key);
    }

    /** called by decorator */
    _queueInitCollection(key:PropKey<T>, serializability:Serializability): void {
        if (!this.___queuedCollectionInit) {this.___queuedCollectionInit=[];}
        this._trackSerializability(key, serializability);
        this.___queuedCollectionInit.push(key);
    }

    /** called by decorator */
    _queueInitProperty(key:PropKey<T>, serializability:Serializability):void {
        if (!this.___queuedPropInit) {this.___queuedPropInit=[];}
        this._trackSerializability(key, serializability);
        this.___queuedPropInit.push(key);
    }

    /** called by decorator */
    _setCustomSerialize(
        key:PropKey<T>,
        serializeFn:CustomSerializeFn,
        deserializeFn:CustomDeserializeFn
    ): void {
        if (!this.customSerializeTable) {this.customSerializeTable=makeCustomSerializeTable();}
        this.customSerializeTable.set(key, {s:serializeFn,d:deserializeFn});
    }

    /** base class must call this (recommmended in constructor) in order for property changed event to work */
    protected init():void {
        if (this.___queuedPropInit) {
            for (const key of this.___queuedPropInit) {
                const property = (this as any)[key];
                if (!(property instanceof Property)) { throw new Error(`It looks like the "observableProperty" decorator was used on non-Property field "${String(key)}" of class "${this.constructor.name}"!`); }
                this.properties.set(key, property);
                // TODO: what if listeners do async work? how do we wait for it?
                property.addListener(()=>this.notifyPropertyChangedEventListeners(key));
            }
            this.___queuedPropInit = undefined;
        }
        if (this.___queuedCollectionInit) {
            for (const key of this.___queuedCollectionInit) {
                const collection = (this as any)[key];
                if (!(collection instanceof ObservableCollection)) { throw new Error(`It looks like the "observableCollection" decorator was used on non-ObservableCollection field "${String(key)}" of class "${this.constructor.name}"!`); }
                this.collections.set(key, collection);
                // TODO: what if listeners do async work? how do we wait for it?
                collection.addCollectionChangedListener(()=>this.notifyPropertyChangedEventListeners(key));
                collection.addItemChangedListener(()=>this.notifyPropertyChangedEventListeners(key));
            }
            this.___queuedCollectionInit = undefined;
        }
        if (this.___queuedChildInit) {
            for (const key of this.___queuedChildInit) {
                const child = (this as any)[key];
                if (!(child instanceof ObservableObject)) { throw new Error(`It looks like the "observableChild" decorator was used on non-ObservableObject field "${String(key)}" of class "${this.constructor.name}"!`); }
                this.observableChildren.set(key, child);
                // TODO: what if listeners do async work? how do we wait for it?
                child.addPropertyChangedEventListener(()=>this.notifyPropertyChangedEventListeners(key));
            }
            this.___queuedChildInit = undefined;
        }
    }

    /** if it doesn't look like init was called, throw an error */
    initCheck():void|never {
        if (this.___queuedChildInit || this.___queuedCollectionInit || this.___queuedPropInit) {
            const error = new Error(`It appears a developer forgot to call init() after super() when ${this.constructor.name} extended ObservableObject!`);
            showError('Programmer Error', 'Forgot to init', error);
            throw error;
        }
    }

    /** register for updates when a property changes */
    addPropertyChangedEventListener(listener:PropertyChangedListener<T>):void {
        this.propertyChangedListeners.push(listener);
    }

    /** inverse operation from serialize */
    async deserialize(data:{[key:string]:FieldType}):Promise<void> {
        for (const [key, child] of this.observableChildren) {
            if (this.undeserializableFields && this.undeserializableFields.has(key)) { continue; }
            const childData = data[String(key)];
            if ((childData !== null) &&
                (typeof childData !== 'string') &&
                (typeof childData !== 'number') &&
                (typeof childData !== 'boolean') &&
                !Array.isArray(childData) )
            {
                await child.deserialize(childData);
            }
        }
        for (const [key, collection] of this.collections) {
            if (this.undeserializableFields && this.undeserializableFields.has(key)) { continue; }
            if (this.customSerializeTable && this.customSerializeTable.has(key)) { continue; }
            const collectionData = data[String(key)];
            if (Array.isArray(collectionData)) {
                await collection.deserialize(collectionData);
            }
        }
        for (const [key, property] of this.properties) {
            if (this.undeserializableFields && this.undeserializableFields.has(key)) { continue; }
            if (this.customSerializeTable && this.customSerializeTable.has(key)) { continue; }
            const stringKey = String(key);
            const propertyData = Object.prototype.hasOwnProperty.call(data, stringKey) ? data[stringKey] : property.getDefault();
            await property.set(propertyData);
        }

        if (this.customSerializeTable) {
            for (const [key,{d}] of this.customSerializeTable) {
                if (this.undeserializableFields && this.undeserializableFields.has(key)) { continue; }
                const observableField = this.properties.get(key)||this.collections.get(key)||this.observableChildren.get(key);
                if (!observableField) {continue;}
                await d(this, observableField, data[String(key)]);
            }
        }
    }

    /** call callback for each child observable */
    forEachChild(cb:(key:PropKey<T>, child:ObservableObject<any>)=>any):void {
        for (const entry of this.observableChildren) {
            cb(...entry);
        }
    }

    /** call callback for each observable collection */
    forEachCollection(cb:(key:PropKey<T>, collection:ObservableCollection<any>)=>any):void {
        for (const entry of this.collections) {
            cb(...entry);
        }
    }

    /** call callback for each property */
    forEachProperty(cb:(key:PropKey<T>, property:Property<FieldType>)=>any):void {
        for (const entry of this.properties) {
            cb(...entry);
        }
    }

    /** retrieve a child observable by name */
    getChild(key:PropKey<T>):ObservableObject<any> {
        return this.observableChildren.get(key) || noSuchProperty(this, key);
    }

    /** retrieve a collection property by name */
    getCollection(key:PropKey<T>):ObservableCollection<any> {
        return this.collections.get(key) || noSuchProperty(this, key);
    }

    /** retrieve a property by name */
    getProperty(key:PropKey<T>):Property<FieldType> {
        return this.properties.get(key) || noSuchProperty(this, key);
    }

    /** retrieve a property value by name */
    getPropertyValue(propName:PropKey<T>):FieldType {
        return this.getProperty(propName)?.get();
    }

    /** send out notification of a property changing */
    private notifyPropertyChangedEventListeners(propName:PropKey<T>):void {
        const backup = this.propertyChangedListeners.concat();
        // TODO: what if listeners do async work? how do we wait for it?
        backup.forEach(cb=>cb(propName));
    }

    /** unregister for updates when a property changes */
    removePropertyChangedEventListener(listener:PropertyChangedListener<T>):void {
        this.propertyChangedListeners = this.propertyChangedListeners.filter(i=>i!==listener);
    }

    /** reset all properties to default values */
    async reset():Promise<void> {
        const promises = [];
        for (const child of this.observableChildren.values()) {
            promises.push(child.reset());
        }
        for (const collection of this.collections.values()) {
            promises.push(collection.clear());
        }
        for (const property of this.properties.values()) {
            promises.push(property.reset());
        }
        await Promise.all(promises);
    }

    /** convert to an object ready for JSON conversion and that could be read back with deserialize */
    serialize():{[key:string]:FieldType} {
        const converted:{[key:string]:FieldType} = {};

        for (const [key, child] of this.observableChildren) {
            if (this.unserializableFields && this.unserializableFields.has(key)) { continue; }
            if (this.customSerializeTable && this.customSerializeTable.has(key)) { continue; }
            converted[String(key)] = child.serialize();
        }
        for (const [key, collection] of this.collections) {
            if (this.unserializableFields && this.unserializableFields.has(key)) { continue; }
            if (this.customSerializeTable && this.customSerializeTable.has(key)) { continue; }
            converted[String(key)] = collection.serialize();
        }
        for (const [key, property] of this.properties) {
            if (this.unserializableFields && this.unserializableFields.has(key)) { continue; }
            if (this.customSerializeTable && this.customSerializeTable.has(key)) { continue; }
            if (!property.isDefault()) {
                converted[String(key)] = property.get();
            }
        }

        if (this.customSerializeTable) {
            for (const [key,{s}] of this.customSerializeTable) {
                const observableField = this.properties.get(key)||this.collections.get(key)||this.observableChildren.get(key);
                if (!observableField) {continue;}
                converted[String(key)] = s(this, observableField);
            }
        }

        return converted;
    }

    /** set a property value by name */
    async setPropertyValue(propName:PropKey<T>, value:FieldType):Promise<void> {
        await this.getProperty(propName)?.set(value);
    }
}
