/**
 * @module AttributeBinding
 */
import {BaseBinding, Property} from './base-binding'

/** one way binding to map a string property to an attribute of an element */
export default class AttributeBinding extends BaseBinding<string> {
    constructor(element:HTMLElement, attributeName:string, property:Property<string>) {
        super(
            element,
            property,
            '',
            null,
            v=>element.setAttribute(attributeName, v));
    }
}