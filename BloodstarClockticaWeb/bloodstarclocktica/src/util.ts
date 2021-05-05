/**
 * Miscellaneous useful things
 * @module Util
 */

/** configuration used to create DOM elements */
export type CreateElementOptions<K extends keyof HTMLElementTagNameMap> = {
    /** tag name of the element to create */
    t:K

    /** attributes to set on the created element (used the same as a) */
    a?:{[key:string]:string},

    /** children to append or configuration used to create those children */
    children?:CreateElementsOptions,

    /** css classes to add to the element */
    css?:string[],

    /** event listeners to add to the element */
    events?:{[key:string]:EventListenerOrEventListenerObject|undefined},

    /** inner text to set on the element */
    txt?:string,
};

export type CreateElementsOptions = (CreateElementOptions<keyof HTMLElementTagNameMap>)[];

/** more concise element creation. see comments on CreateElementOptions */
export function createElement<K extends keyof HTMLElementTagNameMap>(options:CreateElementOptions<K>):HTMLElementTagNameMap[K] {
    const {a: attributes, children, css: classes, events: eventListeners, txt: innerText, t: tag} = options;
    const element = document.createElement(tag);

    if (attributes) {
        for (const key of Object.keys(attributes)) {
            const value = attributes[key];
            element.setAttribute(key, value);
        }
    }

    if (innerText !== undefined) {
        element.innerText = innerText;
    }

    if (classes) {
        for (const className of classes) {
            element.classList.add(className);
        }
    }

    if (children) {
        for (const childOptions of children) {
            if (childOptions instanceof Node) {
                element.appendChild(childOptions);
            } else {
                const child = createElement(childOptions);
                element.appendChild(child);
            }
        }
    }

    if (eventListeners) {
        for (const eventType of Object.keys(eventListeners)) {
            const listener = eventListeners[eventType];
            if (!listener) {continue;}
            element.addEventListener(eventType, listener);
        }
    }

    return element;
}

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