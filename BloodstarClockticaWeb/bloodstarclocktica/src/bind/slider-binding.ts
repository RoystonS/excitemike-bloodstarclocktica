import {BaseBinding, Property} from './base-binding';

function syncFromElementToProperty(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>):void {
    property.set(parseFloat(element.value));
    if (valueLabel) { valueLabel.innerText = element.value; }
}
function syncFromPropertyToElement(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>):void {
    element.value=String(property.get());
    if (valueLabel) { valueLabel.innerText = element.value; }
}

export default class SliderBinding  extends BaseBinding<number> {
    constructor(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>) {
        super(
            element,
            property,
            'change',
            _=>syncFromElementToProperty(element, valueLabel, property),
            _=>syncFromPropertyToElement(element, valueLabel, property)
        );
    }
}