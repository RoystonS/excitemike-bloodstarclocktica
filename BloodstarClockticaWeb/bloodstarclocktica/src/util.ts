/**
 * Miscellaneous useful things
 * @module Util
 */

/** set event listeners for clicks, return a function you can call to undo it */
export function hookupClickEvents(data: [string, (e: Event) => void][]):()=>void {
    for (const [id, cb] of data) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("click", cb);
        }
    }

    const backupData = data;
    return ()=>{
        for (const [id, cb] of backupData) {
            const element = document.getElementById(id);
            if (element) {
                element.removeEventListener("click", cb);
            }
        }
    }
}

/** show/hide the element */
export function showHideElement(element:Element, visible:boolean):void {
    if (visible) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

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