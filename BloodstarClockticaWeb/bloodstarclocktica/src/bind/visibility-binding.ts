import {BaseBinding, FieldType, Property} from './base-binding'

/** one way binding to `display` property of element style to tie its visibility to a boolean property */
export class VisibilityBinding<ValueType extends FieldType> extends BaseBinding<ValueType> {
    constructor(element:HTMLElement, property:Property<ValueType>) {
        const oldDisplay = element.style.display;
        const defaultDisplay = (oldDisplay==='none')?'unset':oldDisplay;
        super(
            element,
            property,
            '',
            null,
            v=>element.style.display=(v?defaultDisplay:'none'));
    }
}