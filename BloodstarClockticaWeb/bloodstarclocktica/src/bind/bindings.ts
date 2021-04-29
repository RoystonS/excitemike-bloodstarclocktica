import {ObservableCollection} from './observable-collection';
import {ObservableObject} from './observable-object';
import {CollectionBinding, RenderFn, CleanupFn} from './collection-binding'

export type PropertyChangeListener<T> = (value:T)=>void;

/** generic observable property */
export class Property<T> {
    value:T;
    listeners:PropertyChangeListener<T>[];

    constructor(value:T) {
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
    private notifyListeners() {
        const backup = this.listeners.concat();
        backup.forEach(cb=>cb(this.value));
    }
}

type DisplayValuePair<ValueType> = {display:string,value:ValueType};
type DisplayValuePairs<ValueType> = ReadonlyArray<DisplayValuePair<ValueType>>;

/** observable property for an enum/select element */
export class EnumProperty<ValueType> extends Property<ValueType> {
    options:DisplayValuePairs<ValueType>;

    constructor(value:ValueType, displayValuePairs:DisplayValuePairs<ValueType>) {
        super(value);
        this.options = displayValuePairs;
    }
}

/** central authority on bindings */
const bindings = new Map<Node, Binding>();

type AnyProperty<ValueType> = Property<ValueType> | EnumProperty<ValueType>;
type Binding = CheckboxBinding | TextBinding | ComboBoxBinding | CollectionBinding<any>;
type SyncFromElementToPropertyFn = ((_:Event)=>void)|null;
type SyncFromPropertyToElementFn<ValueType> = ((v:ValueType)=>void) | null;

/** shared code between binding classes */
class BaseBinding<ValueType> {
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
}

/** bindings for a checkbox */
class CheckboxBinding extends BaseBinding<boolean> {
    constructor(element:HTMLInputElement, property:AnyProperty<boolean>) {
        super(element, property, 'change', _=>property.set(element.checked), v=>element.checked=v);
    }
}

/** binding between a label, input text, ot text area element and a string property */
class TextBinding extends BaseBinding<string> {
    constructor(element:HTMLElement, property:Property<string>) {
        if ((element instanceof HTMLTextAreaElement) || (element instanceof HTMLInputElement)) {
            super(element, property, 'input', _=>property.set(element.value), v=>element.value=v);
        } else {
            super(element, property, '', null, v=>element.innerText=v);
        }
    }
}

/** bindings for a ComboBox and EnumProperty */
class ComboBoxBinding extends BaseBinding<string> {
    constructor(element:HTMLSelectElement, property:EnumProperty<string>) {
        element.innerText = '';
        property.options.forEach(data => {
            const {display, value} = data;
            const optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.innerText = display;
            element.appendChild(optionElement);
        });

        super(element, property, 'change', _=>property.set(element.value), v=>element.value=v);

        element.value = property.get();
    }
}

/** bind checkbox to some data */
export function bindCheckbox(checkboxElement:HTMLInputElement, boolProperty:Property<boolean>) {
    unbindElement(checkboxElement);
    bindings.set(checkboxElement, new CheckboxBinding(checkboxElement, boolProperty));
}

/** bind checkbox to some data */
export function bindCheckboxById(id:string, boolProperty:Property<boolean>) {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        bindCheckbox(element, boolProperty);
    }
}

/** bind ComboBox to EnumProperty */
export function bindComboBox(selectElement:HTMLSelectElement, enumProperty:EnumProperty<string>) {
    unbindElement(selectElement);
    bindings.set(selectElement, new ComboBoxBinding(selectElement, enumProperty));
}

/** bind ComboBox to EnumProperty */
export function bindComboBoxById(id:string, enumProperty:EnumProperty<string>) {
    const element = document.getElementById(id);
    if (element instanceof HTMLSelectElement) {
        bindComboBox(element, enumProperty);
    }
}

/** bind a string property to a label, input text, or text area element */
export function bindText(element:HTMLElement, property:Property<string>):void {
    unbindElement(element);
    bindings.set(element, new TextBinding(element, property));
}

/** bind a string property to a label, input text, or text area element */
export function bindTextById(id:string, property:Property<string>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindText(element, property);
    }
}

/** bind a collection of items, and callbacks to create/destroy/update items to a parent element */
export function bindCollection<T extends ObservableObject>(element:HTMLOListElement, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>):void {
    unbindElement(element);
    bindings.set(element, new CollectionBinding(element, collection, renderFn, cleanupFn));
}

/** bind a collection of items, and callbacks to create/destroy/update items to a parent element */
export function bindCollectionById<T extends ObservableObject>(id:string, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLOListElement) {
        bindCollection(element, collection, renderFn, cleanupFn);
    }
}

/** clear element's current binding, if any */
export function unbindElement(element:Node) {
    if (bindings.has(element)) {
        bindings.get(element)?.destroy();
    }
    bindings.delete(element);
}

/** clear element's current binding, if any */
export function unbindElementById(id:string) {
    const element = document.getElementById(id);
    if (!element) {return;}
    unbindElement(element);
}