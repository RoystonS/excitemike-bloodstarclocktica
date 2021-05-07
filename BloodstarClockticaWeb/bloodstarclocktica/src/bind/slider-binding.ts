import {BaseBinding, Property} from './base-binding';

async function syncFromElementToProperty(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>):Promise<void> {
    await property.set(parseFloat(element.value));
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
            async ()=>syncFromElementToProperty(element, valueLabel, property),
            ()=>syncFromPropertyToElement(element, valueLabel, property)
        );
    }
}