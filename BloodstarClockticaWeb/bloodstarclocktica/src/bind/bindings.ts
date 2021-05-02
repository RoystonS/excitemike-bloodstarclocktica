import {BaseBinding, Property, PropertyChangeListener} from './base-binding'
import {CollectionBinding, RenderFn, CleanupFn} from './collection-binding'
import {ImageChooserBinding, ImageDisplayBinding} from './image-binding';
import {StyleBinding} from './style-binding';
import {ObservableCollection} from './observable-collection';
import {ObservableObject} from './observable-object';

export type DisplayValuePair<ValueType> = {display:string,value:ValueType};
export type DisplayValuePairs<ValueType> = ReadonlyArray<DisplayValuePair<ValueType>>;

/** observable property for an enum/select element */
export class EnumProperty<ValueType> extends Property<ValueType> {
    private options:DisplayValuePairs<ValueType>;

    constructor(value:ValueType, displayValuePairs:DisplayValuePairs<ValueType>) {
        super(value);
        this.options = displayValuePairs;
    }

    /** get the display string for the current value */
    getDisplay():string {
        const myValue = this.get();
        for (const {display,value} of this.options) {
            if (value === myValue) {
                return display;
            }
        }
        return '';
    }

    /** get the {display,value} pairs for the enum options */
    getOptions():DisplayValuePairs<ValueType> { return this.options; }
}

/** central authority on bindings */
const bindings = new Map<Node, Binding>();

type Binding = BaseBinding<any> | CollectionBinding<any>;

/** bindings for a checkbox */
class CheckboxBinding extends BaseBinding<boolean> {
    constructor(element:HTMLInputElement, property:Property<boolean>) {
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

/** binding between a label, input text, ot text area element and a string property, showing the display string rather the value */
class TextEnumBinding extends BaseBinding<any> {
    constructor(element:HTMLElement, property:EnumProperty<any>) {
        if ((element instanceof HTMLTextAreaElement) || (element instanceof HTMLInputElement)) {
            super(element, property, 'input', null, _=>element.value=property.getDisplay());
        } else {
            super(element, property, '', null, _=>element.innerText=property.getDisplay());
        }
    }
}

/** bindings for a ComboBox and EnumProperty */
class ComboBoxBinding<T> extends BaseBinding<T> {
    constructor(element:HTMLSelectElement, property:EnumProperty<T>, stringToEnum:(s:string)=>T, enumToString:(t:T)=>string) {
        element.innerText = '';
        property.getOptions().forEach(data => {
            const {display, value} = data;
            const optionElement = document.createElement('option');
            optionElement.value = String(value);
            optionElement.innerText = display;
            element.appendChild(optionElement);
        });

        const syncFromElementToProperty = (_:Event)=>property.set(stringToEnum(element.value));
        const syncFromPropertyToElement = (value:T)=>element.value=enumToString(value);
        super(element, property, 'change', syncFromElementToProperty, syncFromPropertyToElement);

        syncFromPropertyToElement(property.get());
    }
}

/** bind checkbox to some data */
export function bindCheckbox(checkboxElement:HTMLInputElement, boolProperty:Property<boolean>) {
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
export function bindComboBox<T>(selectElement:HTMLSelectElement, enumProperty:EnumProperty<T>, stringToEnum:(s:string)=>T, enumToString:(t:T)=>string) {
    bindings.set(selectElement, new ComboBoxBinding<T>(selectElement, enumProperty, stringToEnum, enumToString));
}

/** bind ComboBox to EnumProperty */
export function bindComboBoxById<T>(id:string, enumProperty:EnumProperty<T>, stringToEnum:(s:string)=>T, enumToString:(t:T)=>string) {
    const element = document.getElementById(id);
    if (element instanceof HTMLSelectElement) {
        bindComboBox<T>(element, enumProperty, stringToEnum, enumToString);
    }
}

/** bind a string property to a label, input text, or text area element */
export function bindText(element:HTMLElement, property:Property<string>):void {
    bindings.set(element, new TextBinding(element, property));
}

/** bind a string property to a label, input text, or text area element */
export function bindTextById(id:string, property:Property<string>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindText(element, property);
    }
}

/** bind an enumproperty to a label, input text, or text area element, showing the display name of the value rather than the value */
export function bindEnumDisplay(element:HTMLElement, property:EnumProperty<any>):void {
    bindings.set(element, new TextEnumBinding(element, property));
}

/** bind an enumproperty to a label, input text, or text area element, showing the display name of the value rather than the value */
export function bindEnumDisplayById(id:string, property:EnumProperty<string>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindEnumDisplay(element, property);
    }
}

/** bind a collection of items, and callbacks to create/destroy/update items to a parent element */
export function bindCollection<T extends ObservableObject>(element:HTMLOListElement, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>):void {
    bindings.set(element, new CollectionBinding(element, collection, renderFn, cleanupFn));
}

/** bind a collection of items, and callbacks to create/destroy/update items to a parent element */
export function bindCollectionById<T extends ObservableObject>(id:string, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLOListElement) {
        bindCollection(element, collection, renderFn, cleanupFn);
    }
}

/** bind an image to a `string|null` property that stores an object url */
export function bindImageDisplay(element:HTMLImageElement, property:Property<string|null>):void {
    bindings.set(element, new ImageDisplayBinding(element, property));
}

/** bind an image to a `string|null` property that stores an object url */
export function bindImageDisplayById(id:string, property:Property<string|null>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLImageElement) {
        bindImageDisplay(element, property);
    }
}

/** bind an `input[type=file]` element to a `string|null` property that stores an object url */
export function bindImageChooser(element:HTMLInputElement, property:Property<string|null>, maxWidth?:number, maxHeight?:number):void {
    bindings.set(element, new ImageChooserBinding(element, property, maxWidth, maxHeight));
}

/** bind an `input[type=file] to a `string|null` property that stores an object url */
export function bindImageChooserById(id:string, property:Property<string|null>, maxWidth?:number, maxHeight?:number):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        bindImageChooser(element, property, maxWidth, maxHeight);
    }
}

/** one way binding. automatically add or remove a css class based on the property value and callback */
export function bindStyle<T>(element:HTMLElement, property:Property<T>, cb:(value:T, classList:DOMTokenList)=>void):void {
    bindings.set(element, new StyleBinding<T>(element, property, cb));
}

/** one way binding. automatically add or remove a css class based on the property value and callback */
export function bindbindStyleById<T>(id:string, property:Property<T>, cb:(value:T, classList:DOMTokenList)=>void):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindStyle(element, property, cb);
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

// re-export
export {Property, PropertyChangeListener};