import {BaseBinding, Property} from './base-binding';

export default class SliderBinding  extends BaseBinding<number> {
    constructor(element:HTMLInputElement, property:Property<number>) {
        super(element, property, 'input', _=>property.set(parseFloat(element.value)), v=>element.value=String(v));
    }
}