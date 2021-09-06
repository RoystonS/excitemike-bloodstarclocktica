import './styles/curtain.css';
import { arrayGetLast } from './util';

/** track currently open curtain menu */
const curtainStack: Element[] = [];

/** close entire curtain history */
export function closeAllCurtains():void {
    const n = curtainStack.length;
    if (n) {
        // get rid of the one that's up, and rewind all the way
        const curCurtain = arrayGetLast(curtainStack, null);
        curCurtain?.removeAttribute('open');
        curtainStack.length = 0;
        history.go(-n);
    }
}

/** close currently-open curtain menu, if any */
export function closeCurtain():void {
    // rewind
    if (curtainStack.length) {
        history.back();
    }
}

/** close currently-open curtain menu and open a new one */
export function openCurtainMenu(id:string):void {
    // we're replacing any current curtain, so hide without rewinding
    if (curtainStack.length) {
        const oldCurtain = curtainStack[curtainStack.length-1];
        oldCurtain.removeAttribute('open');
    }
    // reveal new one and track history
    if (id) {
        const newCurtain = document.getElementById(id);
        if (!newCurtain) {return;}
        newCurtain.setAttribute('open', 'true');
        curtainStack.push(newCurtain);
        // TODO: should probably merge with current state instead of clobbering
        // TODO: manually trigger popstate? (see https://stackoverflow.com/a/37492075)
        history.pushState(null, '');
    }
}

window.addEventListener('popstate', () => {
    if (curtainStack.length) {
        // current one goes away
        const oldCurtain = curtainStack.pop();
        oldCurtain?.removeAttribute('open');

        // reveal the one we are at now
        const newCurtain = arrayGetLast(curtainStack, null);
        newCurtain?.setAttribute('open', 'true');
    }
});
