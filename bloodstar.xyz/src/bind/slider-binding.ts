import {BaseBinding, Property} from './base-binding';

function updateValueLabel(element:HTMLInputElement, valueLabel:HTMLElement|null) {
    if (valueLabel) {
        const places = valueLabel.dataset.places;
        if (places === undefined) {
            valueLabel.innerText = element.value;
        } else {
            valueLabel.innerText = Number(element.value).toFixed(Number(places));
        }
    }
}

async function syncFromElementToProperty(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>):Promise<void> {
    await property.set(parseFloat(element.value));
    updateValueLabel(element, valueLabel);
}
function syncFromPropertyToElement(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>):void {
    element.value=String(property.get());
    updateValueLabel(element, valueLabel);
}

export default class SliderBinding  extends BaseBinding<number> {
    constructor(element:HTMLInputElement, valueLabel:HTMLElement|null, property:Property<number>) {
        super(
            element,
            property,
            'change',
            ()=>syncFromElementToProperty(element, valueLabel, property),
            ()=>syncFromPropertyToElement(element, valueLabel, property)
        );
    }
}