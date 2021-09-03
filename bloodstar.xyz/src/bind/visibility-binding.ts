import {BaseBinding, Property} from './base-binding';
import { showHideElement } from '../util';
/** one way binding to `display` property of element style to tie its visibility to a boolean property */
export class VisibilityBinding extends BaseBinding<boolean> {
    constructor(element:HTMLElement, property:Property<boolean>) {
        super(
            element,
            property,
            '',
            null,
            v=>{ showHideElement(element, v); });
    }
}