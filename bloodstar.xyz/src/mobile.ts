import { hookupClickEvents } from './util';

/** track currently open curtain menu */
let currentCurtain: Element|null = null;

/** initialize listeners for mobile version of bloodstar */
export function initMobileBindings():void {
    hookupClickEvents([
        ['mobileHamburger', ()=>openCurtainMenu('mobileMainMenu')],
        ['mobileSignInOut', ()=>openCurtainMenu('mobileSignInOutMainMenu')],
        ['mobileFileButton', ()=>openCurtainMenu('mobileFileMenu')],
        ['mobileImportButton', ()=>openCurtainMenu('mobileImportMenu')],
        ['mobilePublishButton', ()=>openCurtainMenu('mobilePublishMenu')],
        ['openCharacterPaneBtn', ()=>openCurtainMenu('characterPane')],
    ]);

    // find ALL `closeCurtainBtn`
    const allCloseBtns = document.getElementsByClassName('closeCurtainBtn')
    for (let i = 0; i < allCloseBtns.length; i++) {
        const btn = allCloseBtns[i];
        btn.addEventListener("click", closeCurtain);
    }
}

/** close currently-open curtain menu, if any */
function closeCurtain() {
    if (!currentCurtain) {return;}
    currentCurtain?.removeAttribute('open');
    currentCurtain = null;
}

/** close currently-open curtain menu and open a new one */
function openCurtainMenu(id:string):void {
    closeCurtain();
    currentCurtain = document.getElementById(id);
    currentCurtain?.setAttribute('open','true');
}
