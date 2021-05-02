import {BaseBinding, Property} from './base-binding'

/** one way binding to modify class list based on the property value and callback */
export class StyleBinding<T> extends BaseBinding<T> {
    constructor(element:HTMLElement, property:Property<T>, cb:(value:T, classList:DOMTokenList)=>void) {
        super(
            element,
            property,
            '',
            null,
            v=>cb(v,element.classList));
    }
}