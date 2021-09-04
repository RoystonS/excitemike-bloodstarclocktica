/* eslint-disable @typescript-eslint/no-explicit-any */
import {BaseBinding, Property, PropertyChangeListener} from './base-binding';
import AttributeBinding from './attribute-binding';
import {CleanupFn, CollectionBinding, RenderFn} from './collection-binding';
import {ImageChooserBinding, ImageDisplayBinding} from './image-binding';
import SliderBinding from './slider-binding';
import {StyleBinding} from './style-binding';
import {VisibilityBinding} from './visibility-binding';
import {ObservableCollection} from './observable-collection';
import {ObservableObject} from './observable-object';

export type DisplayValuePair<ValueType> = {display:string; value:ValueType};
export type DisplayValuePairs<ValueType> = readonly DisplayValuePair<ValueType>[];

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
        for (const {display, value} of this.options) {
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
const bindings = new Map<Node, Binding[]>();

type Binding = BaseBinding<any> | CollectionBinding<any>;

/** bindings for a checkbox */
class CheckboxBinding extends BaseBinding<boolean> {
    constructor(element:HTMLInputElement, property:Property<boolean>) {
        super(element, property, 'change', async ()=>property.set(element.checked), v=>{element.checked=v;});
    }
}

/** binding between a label, input text, ot text area element and a string property */
class TextBinding extends BaseBinding<string> {
    constructor(node:Node, property:Property<string>) {
        if ((node instanceof HTMLTextAreaElement) || (node instanceof HTMLInputElement)) {
            super(node, property, 'input', async ()=>property.set(node.value), v=>{
                node.value=v;
                node.dispatchEvent(new Event('change'));
                node.dispatchEvent(new Event('input'));
            });
        } else if (node instanceof HTMLElement) {
            super(node, property, '', null, v=>{node.innerText=v;});
        } else {
            super(node, property, '', null, v=>{node.textContent=v;});
        }
    }
}

/** binding between a label, input text, ot text area element and a string property, showing the display string rather the value */
class TextEnumBinding extends BaseBinding<any> {
    constructor(element:HTMLElement, property:EnumProperty<any>) {
        if ((element instanceof HTMLTextAreaElement) || (element instanceof HTMLInputElement)) {
            super(element, property, 'input', null, ()=>{element.value=property.getDisplay();});
        } else {
            super(element, property, '', null, ()=>{element.innerText=property.getDisplay();});
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

        const syncFromElementToProperty = async ()=>property.set(stringToEnum(element.value));
        const syncFromPropertyToElement = (value:T)=>{element.value=enumToString(value);};
        super(element, property, 'change', syncFromElementToProperty, syncFromPropertyToElement);

        syncFromPropertyToElement(property.get());
    }
}

/** add a binding for the given element to be later cleaned up with unbindElement */
function addBinding(element:Node, binding:Binding):void {
    let bindingsForElement = bindings.get(element);
    if (!bindingsForElement) {
        bindingsForElement = [];
        bindings.set(element, bindingsForElement);
    }
    bindingsForElement.push(binding);
}

/** ONE WAY. bind a string property to an element attribute */
export function bindAttribute(element:HTMLElement, attributeName:string, property:Property<string>):void {
    addBinding(element, new AttributeBinding(element, attributeName, property));
}

/** bind checkbox to some data */
export function bindCheckbox(checkboxElement:HTMLInputElement, boolProperty:Property<boolean>):void {
    addBinding(checkboxElement, new CheckboxBinding(checkboxElement, boolProperty));
}

/** bind checkbox to some data */
export function bindCheckboxById(id:string, boolProperty:Property<boolean>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        bindCheckbox(element, boolProperty);
    }
}

/** bind ComboBox to EnumProperty */
export function bindComboBox<ValueType>(selectElement:HTMLSelectElement, enumProperty:EnumProperty<ValueType>, stringToEnum:(s:string)=>ValueType, enumToString:(t:ValueType)=>string):void {
    addBinding(selectElement, new ComboBoxBinding<ValueType>(selectElement, enumProperty, stringToEnum, enumToString));
}

/** bind ComboBox to EnumProperty */
export function bindComboBoxById<ValueType>(id:string, enumProperty:EnumProperty<ValueType>, stringToEnum:(s:string)=>ValueType, enumToString:(t:ValueType)=>string):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLSelectElement) {
        bindComboBox<ValueType>(element, enumProperty, stringToEnum, enumToString);
    }
}

/** bind a string property to a label, input text, text area, or even SVG element */
export function bindText(element:Node, property:Property<string>):void {
    addBinding(element, new TextBinding(element, property));
}

/** bind a string property to a label, input text, or text area element */
export function bindTextById(id:string, property:Property<string>):void {
    const element = document.getElementById(id);
    if (element instanceof Node) {
        bindText(element, property);
    }
}

/** bind a number property to a input[type=range] element */
export function bindSlider(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>):void {
    addBinding(element, new SliderBinding(element, valueLabel, property));
}

/** bind a number property to a input[type=range] element */
export function bindSliderById(id:string, valueLabelId:string|null, property:Property<number>):void {
    const element = document.getElementById(id);
    const valueLabel = (valueLabelId===null)?null:document.getElementById(valueLabelId);
    if (element instanceof HTMLInputElement) {
        bindSlider(element, valueLabel, property);
    }
}

/** bind an enumproperty to a label, input text, or text area element, showing the display name of the value rather than the value */
export function bindEnumDisplay(element:HTMLElement, property:EnumProperty<any>):void {
    addBinding(element, new TextEnumBinding(element, property));
}

/** bind an enumproperty to a label, input text, or text area element, showing the display name of the value rather than the value */
export function bindEnumDisplayById(id:string, property:EnumProperty<string>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindEnumDisplay(element, property);
    }
}

/** bind a collection of items, and callbacks to create/destroy/update items to a parent element */
export function bindCollection<T extends ObservableObject<T>>(element:HTMLOListElement, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>):void {
    addBinding(element, new CollectionBinding(element, collection, renderFn, cleanupFn));
}

/** bind a collection of items, and callbacks to create/destroy/update items to a parent element */
export function bindCollectionById<T extends ObservableObject<T>>(id:string, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLOListElement) {
        bindCollection(element, collection, renderFn, cleanupFn);
    }
}

/** bind an image to a `string|null` property that stores an object url */
export function bindImageDisplay(element:HTMLImageElement, property:Property<string|null>):void {
    addBinding(element, new ImageDisplayBinding(element, property));
}

/** bind an image to a `string|null` property that stores an object url */
export function bindImageDisplayById(id:string, property:Property<string|null>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLImageElement) {
        bindImageDisplay(element, property);
    }
}

/** bind an `input[type=file]` element to a `string|null` property that stores an object url */
export function bindImageChooser(element:HTMLInputElement, property:Property<string|null>, maxWidth:number, maxHeight:number):void {
    addBinding(element, new ImageChooserBinding(element, property, maxWidth, maxHeight));
}

/** bind an `input[type=file] to a `string|null` property that stores an object url */
export function bindImageChooserById(id:string, property:Property<string|null>, maxWidth:number, maxHeight:number):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        bindImageChooser(element, property, maxWidth, maxHeight);
    }
}

/** one way binding. automatically add or remove a css class based on the property value and callback */
export function bindStyle<ValueType>(element:HTMLElement, property:Property<ValueType>, cb:(value:ValueType, classList:DOMTokenList)=>void):void {
    addBinding(element, new StyleBinding<ValueType>(element, property, cb));
}

/** one way binding. automatically add or remove a css class based on the property value and callback */
export function bindStyleById<ValueType>(id:string, property:Property<ValueType>, cb:(value:ValueType, classList:DOMTokenList)=>void):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindStyle(element, property, cb);
    }
}

/** one-way binding. make the element visible or not based on a boolean property */
export function bindVisibility(element:HTMLElement, property:Property<boolean>):void {
    addBinding(element, new VisibilityBinding(element, property));
}

/** one-way binding. make the element visible or not based on a boolean property */
export function bindVisibilityById(id:string, property:Property<boolean>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
        bindVisibility(element, property);
    }
}

/** clear element's current binding, if any */
export function unbindElement(element:Node):void {
    const bindingsForElement = bindings.get(element);
    if (!bindingsForElement) {return;}
    for (const binding of bindingsForElement) {
        binding.destroy();
    }
    bindings.delete(element);
}

/** clear element's current binding, if any */
export function unbindElementById(id:string):void {
    const element = document.getElementById(id);
    if (!element) {return;}
    unbindElement(element);
}

// re-export
export {Property, PropertyChangeListener};