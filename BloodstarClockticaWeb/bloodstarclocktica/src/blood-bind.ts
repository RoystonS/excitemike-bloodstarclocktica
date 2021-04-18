type PropertyChangeListener<T> = (value:T)=>void;

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
            this._notifyListeners();
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
    _notifyListeners() {
        const backup = this.listeners.concat();
        backup.forEach(cb=>cb(this.value));
    }
}

type DisplayValuePair<ValueType> = {display:string,value:ValueType};
type DisplayValuePairs<ValueType> = DisplayValuePair<ValueType>[];

export class EnumProperty<ValueType> extends Property<ValueType> {
    options:DisplayValuePairs<ValueType>;

    constructor(value:ValueType, displayValuePairs:DisplayValuePairs<ValueType>) {
        super(value);
        this.options = displayValuePairs;
    }
}

/// central authority on bindings
const bindings = new Map<Node, Binding>();
type AnyProperty<ValueType> = Property<ValueType> | EnumProperty<ValueType>;
type Binding = CheckboxBinding | LabelBinding | ComboBoxBinding;

/// bindings for a checkbox
class CheckboxBinding {
    element:HTMLInputElement|null;
    property:Property<boolean>|null;
    syncFromElementToProperty:((_:Event)=>void) | null;
    syncFromPropertyToElement:((v:boolean)=>void) | null;
    constructor(element:HTMLInputElement, property:AnyProperty<boolean>) {
        this.element = element;
        this.property = property;
        
        this.syncFromElementToProperty = _=>property.set(element.checked);
        this.syncFromPropertyToElement = v=>element.checked=v;

        element.checked = property.get();

        element.addEventListener('change', this.syncFromElementToProperty);
        property.addListener(this.syncFromPropertyToElement);
    }
    destroy() {
        if (this.syncFromElementToProperty !== null) {
            this.element?.removeEventListener('change', this.syncFromElementToProperty);
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

/// ONE WAY binding for displaying something in innerText
class LabelBinding {
    element:HTMLElement | null;
    property:Property<string>|null;
    syncFromPropertyToElement:((v:string)=>void) | null;
    constructor(element:HTMLElement, property:Property<string>) {
        this.element = element;
        this.property = property;
        
        this.syncFromPropertyToElement = v=>element.innerText=v;

        element.innerText = property.get();

        property.addListener(this.syncFromPropertyToElement);
    }
    destroy() {
        if (this.syncFromPropertyToElement !== null) {
            this.property?.removeListener(this.syncFromPropertyToElement);
        }
        this.element = null;
        this.property = null;
        this.syncFromPropertyToElement = null;
    }
}

/// bindings for a ComboBox and EnumProperty
class ComboBoxBinding{
    element:HTMLSelectElement | null;
    property:EnumProperty<string>|null;
    syncFromElementToProperty:((_:Event)=>void) | null;
    syncFromPropertyToElement:((v:string)=>void) | null;
    constructor(element:HTMLSelectElement, property:EnumProperty<string>) {
        this.element = element;
        this.property = property;
        
        this.syncFromElementToProperty = _=>property.set(element.value);
        this.syncFromPropertyToElement = v=>element.value=v;

        element.innerText = '';
        property.options.forEach(data => {
            const {display, value} = data;
            const optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.innerText = display;
            element.appendChild(optionElement);
        });

        element.value = property.get();

        element.addEventListener('change', this.syncFromElementToProperty);
        property.addListener(this.syncFromPropertyToElement);
    }
    destroy() {
        if (null !== this.syncFromElementToProperty) {
            this.element?.removeEventListener('change', this.syncFromElementToProperty);
        }
        if (null !== this.syncFromPropertyToElement) {
            this.property?.removeListener(this.syncFromPropertyToElement);
        }
        this.element = null;
        this.property = null;
        this.syncFromElementToProperty = null;
        this.syncFromPropertyToElement = null;
    }
}

/// bind checkbox to some data
export function bindCheckbox(checkboxElement:HTMLInputElement, boolProperty:Property<boolean>) {
    unbindElement(checkboxElement);
    bindings.set(checkboxElement, new CheckboxBinding(checkboxElement, boolProperty));
}

/// bind ComboBox to EnumProperty
export function bindComboBox(selectElement:HTMLSelectElement, enumProperty:EnumProperty<string>) {
    unbindElement(selectElement);
    bindings.set(selectElement, new ComboBoxBinding(selectElement, enumProperty));
}

/// ONE WAY! binding of an element's .innerText to a Property
export function bindLabel(element:HTMLElement, property:Property<string>) {
    unbindElement(element);
    bindings.set(element, new LabelBinding(element, property));
}

/// clear element's current binding, if any
export function unbindElement(element:Node) {
    if (bindings.has(element)) {
        bindings.get(element)?.destroy();
    }
    bindings.delete(element);
}

const BloodBind = {
    Property,
    EnumProperty,
    bindCheckbox,
    bindComboBox,
    bindLabel,
    unbindElement
};

export default BloodBind;