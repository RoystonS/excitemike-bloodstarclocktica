export class Property {
    constructor(value) {
        this.value = value;
        this.listeners = [];
    }
    set(value) {
        if (this.value !== value) {
            this.value = value;
            this._notifyListeners();
        }
    }
    get() {
        return this.value;
    }
    addListener(cb) {
        this.listeners.push(cb);
    }
    removeListener(cb) {
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
export class EnumProperty extends Property {
    constructor(value, displayValuePairs) {
        super(value);
        this.options = displayValuePairs;
    }
}

/// central authority on bindings
const bindings = new Map();

/// bindings for a checkbox
class CheckboxBinding {
    constructor(element, property) {
        this.element = element;
        this.property = property;
        
        this.elementToPropFn = e=>property.set(e.target.checked);
        this.propToElementFn = v=>element.checked=v;

        element.checked = property.get();

        element.addEventListener('change', this.elementToPropFn);
        property.addListener(this.propToElementFn);
    }
    destroy() {
        this.element.removeEventListener('change', this.elementToPropFn);
        this.property.removeListener(this.propToElementFn);
        this.element = null;
        this.property = null;
        this.elementToPropFn = null;
        this.propToElementFn = null;
    }
}

/// ONE WAY binding for displaying something in innerText
class LabelBinding {
    constructor(element, property) {
        this.element = element;
        this.property = property;
        
        this.propToElementFn = v=>element.innerText=v;

        element.innerText = property.get();

        property.addListener(this.propToElementFn);
    }
    destroy() {
        this.property.removeListener(this.propToElementFn);
        this.element = null;
        this.property = null;
        this.propToElementFn = null;
    }
}

/// bindings for a ComboBox and EnumProperty
class ComboBoxBinding {
    constructor(element, property) {
        this.element = element;
        this.property = property;
        
        this.elementToPropFn = e=>property.set(e.target.value);
        this.propToElementFn = v=>element.value=v;

        element.innerText = '';
        property.options.forEach(data => {
            const {display, value} = data;
            const optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.innerText = display;
            element.appendChild(optionElement);
        });

        element.value = property.get();

        element.addEventListener('change', this.elementToPropFn);
        property.addListener(this.propToElementFn);
    }
    destroy() {
        this.element.removeEventListener('change', this.elementToPropFn);
        this.property.removeListener(this.propToElementFn);
        this.element = null;
        this.property = null;
        this.elementToPropFn = null;
        this.propToElementFn = null;
    }
}

/// bind checkbox to some data
export function bindCheckbox(checkboxElement, boolProperty) {
    unbindElement(checkboxElement);
    bindings.set(checkboxElement, new CheckboxBinding(checkboxElement, boolProperty));
}

/// bind ComboBox to EnumProperty
export function bindComboBox(selectElement, enumProperty) {
    unbindElement(selectElement);
    bindings.set(checkboxElement, new ComboBoxBinding(checkboxElement, enumProperty));
}

/// ONE WAY! binding of an element's .innerText to a Property
export function bindLabel(element, property) {
    unbindElement(element);
    bindings.set(element, new LabelBinding(element, property));
}

/// clear element's current binding, if any
export function unbindElement(element) {
    if (bindings.has(element)) {
        bindings.get(element).destroy();
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