/**
 * Miscellaneous useful things
 * @module Util
 */


/** ordinal string based on number */
export function ordinal(n:number):string {
    if (n <= 0) { return n.toFixed(0); }
    switch (n)
    {
        case 11:
        case 12:
        case 13:
            return `${n.toFixed(0)}th`;
        default:
            switch (n % 10)
            {
                case 1: return `${n.toFixed(0)}st`;
                case 2: return `${n.toFixed(0)}nd`;
                case 3: return `${n.toFixed(0)}rd`;
                default: return `${n.toFixed(0)}th`;
            }
    }
}

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