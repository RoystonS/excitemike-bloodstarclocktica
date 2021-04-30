import {BaseBinding, Property, PropertyChangeListener} from './base-binding'
import {CollectionBinding, RenderFn, CleanupFn} from './collection-binding'
import {ImageChooserBinding, ImageDisplayBinding} from './image-binding';
import {ObservableCollection} from './observable-collection';
import {ObservableObject} from './observable-object';

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
type Binding = BaseBinding<any> | CollectionBinding<any>;

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

/** bind an image to a `string|null` property that stores an object url */
export function bindImageDisplay(element:HTMLImageElement, property:Property<string|null>):void {
    unbindElement(element);
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
export function bindImageChooser(element:HTMLInputElement, property:Property<string|null>):void {
    unbindElement(element);
    bindings.set(element, new ImageChooserBinding(element, property));
}

/** bind an `input[type=file] to a `string|null` property that stores an object url */
export function bindImageChooserById(id:string, property:Property<string|null>):void {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        bindImageChooser(element, property);
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