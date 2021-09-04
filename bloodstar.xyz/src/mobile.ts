import './styles/mobile.css';
import { hookupClickEvents } from './util';
import { init, tabClicked } from "./bloodstar";

/** track currently open curtain menu */
let currentCurtain: Element|null = null;

/** initialize listeners for mobile version of bloodstar */
function initMobileBindings():void {
    hookupClickEvents([
        ['mobileHamburger', ()=>{ openCurtainMenu('mobileMainMenu'); }],
        ['mobileSignInOut', ()=>{ openCurtainMenu('mobileSignInOutMenu'); }],
        ['mobileFileButton', ()=>{ openCurtainMenu('mobileFileMenu'); }],
        ['mobileImportButton', ()=>{ openCurtainMenu('mobileImportMenu'); }],
        ['mobilePublishButton', ()=>{ openCurtainMenu('mobilePublishMenu'); }],
        ['mobileSharingButton', ()=>{ openCurtainMenu('mobileSharingMenu'); }],

        ['charlistTabBtn', ()=>{ tabClicked('charlistTabBtn', 'characterlisttab'); }],
    ]);

    // find ALL `closeCurtainBtn`
    const allCloseBtns = document.getElementsByClassName('closeCurtainBtn');
    for (let i = 0; i < allCloseBtns.length; i++) {
        const btn = allCloseBtns[i];
        btn.addEventListener("click", closeCurtain);
    }

    // TODO: escape/back button to close curtain
}

/** close currently-open curtain menu, if any */
function closeCurtain() {
    if (!currentCurtain) {return;}
    currentCurtain.removeAttribute('open');
    currentCurtain = null;
}

/** close currently-open curtain menu and open a new one */
function openCurtainMenu(id:string):void {
    closeCurtain();
    currentCurtain = document.getElementById(id);
    currentCurtain?.setAttribute('open', 'true');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init({mobile:true}).then(()=>{
    initMobileBindings();
});
