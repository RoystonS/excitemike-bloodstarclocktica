/**
 * Miscellaneous useful things
 * @module Util
 */

/** go through a HTMLElement and all its child HTMLElement, and call the function on them */
export function walkHTMLElements(element:HTMLElement, f:(element:HTMLElement)=>void):void {
    if (!(element instanceof HTMLElement)) {return;}
    const stack:HTMLElement[] = [element];
    while (stack.length) {
        const htmlElement = stack.pop();
        if (htmlElement) {
            f(htmlElement);
            for (let i=0; i<htmlElement.children.length;i++) {
                const child = htmlElement.children[i];
                if (child instanceof HTMLElement) {
                    stack.push(child);
                }
            }
        }
    }
}