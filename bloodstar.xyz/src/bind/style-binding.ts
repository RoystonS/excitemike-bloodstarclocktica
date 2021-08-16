import {BaseBinding, Property} from './base-binding'

/** one way binding to modify class list based on the property value and callback */
export class StyleBinding<ValueType> extends BaseBinding<ValueType> {
    constructor(element:HTMLElement, property:Property<ValueType>, cb:(value:ValueType, classList:DOMTokenList)=>void) {
        super(
            element,
            property,
            '',
            null,
            v=>cb(v,element.classList));
    }
}