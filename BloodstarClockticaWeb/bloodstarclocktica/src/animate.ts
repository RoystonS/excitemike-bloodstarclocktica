/**
 * useful functions for animating
 * @module Animate
 */
import './styles/animate.css';

/** animate element away and remove */
export function animateAndRemove(element:HTMLElement, cssClass:string, animName:string):Promise<void> {
    return new Promise(resolve=>{
        // I'm doing both a timeout and an event listener because I am paranoid
        let timeout = -1;
        let listener:((ev:AnimationEvent)=>void)|null = null;
        const doRemove = ()=>{
            if (listener) { element.removeEventListener('animationend', listener); }
            clearTimeout(timeout);
            element.remove();
            resolve();
        };
        listener = (ev:AnimationEvent)=>{
            if (ev.animationName===animName) {
                doRemove();
            }
        };
        timeout = window.setTimeout(doRemove, 400);
        element.addEventListener('animationend', listener);
        element.classList.add(cssClass);
    });
}

/** fade in */
export function appear(element:HTMLElement):void {
    element.classList.add('appear');
}

/** animate in from left */
export function appearFromLeft(element:HTMLElement):void {
    element.classList.add('appearFromLeft');
}

/** fade ut and remove */
export function disappear(element:HTMLElement):Promise<void> {
    return animateAndRemove(element, 'disappear', 'disappearAnim');
}

/** animate element away and remove */
export function disappearToRight(element:HTMLElement):Promise<void> {
    return animateAndRemove(element, 'disappearToRight', 'disappearToRightAnim');
}
