declare type PropertyChangeListener<T> = (value: T) => void;
export declare class Property<T> {
    value: T;
    listeners: PropertyChangeListener<T>[];
    constructor(value: T);
    set(value: T): void;
    get(): T;
    addListener(cb: PropertyChangeListener<T>): void;
    removeListener(cb: PropertyChangeListener<T>): void;
    removeAllListeners(): void;
    _notifyListeners(): void;
}
declare type DisplayValuePair<ValueType> = {
    display: string;
    value: ValueType;
};
declare type DisplayValuePairs<ValueType> = DisplayValuePair<ValueType>[];
export declare class EnumProperty<ValueType> extends Property<ValueType> {
    options: DisplayValuePairs<ValueType>;
    constructor(value: ValueType, displayValuePairs: DisplayValuePairs<ValueType>);
}
export declare function bindCheckbox(checkboxElement: HTMLInputElement, boolProperty: Property<boolean>): void;
export declare function bindComboBox(selectElement: HTMLSelectElement, enumProperty: EnumProperty<string>): void;
export declare function bindLabel(element: HTMLElement, property: Property<string>): void;
export declare function unbindElement(element: Node): void;
declare const BloodBind: {
    Property: typeof Property;
    EnumProperty: typeof EnumProperty;
    bindCheckbox: typeof bindCheckbox;
    bindComboBox: typeof bindComboBox;
    bindLabel: typeof bindLabel;
    unbindElement: typeof unbindElement;
};
export default BloodBind;
