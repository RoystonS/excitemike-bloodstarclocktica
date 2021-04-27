import { CustomEditionType } from '../custom-edition';
import * as Bloodstar from '../bloodstar';
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn = ()=>Promise.resolve(null);
let closeFn:BloodDlg.CloseFn = _=>{};

/// one-time initialization
export function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'You have unsaved changes! Would you like to save now or discard them?';

    const buttons = [
        {label:'Save', callback:async ()=>await Bloodstar.saveFileClicked()},
        {label:'Discard', callback:async ()=>Promise.resolve(true)},
        {label:'Cancel', callback:async ()=>Promise.resolve(false)},
    ];
    ;({open:showFn, close:closeFn} = BloodDlg.init('sdc-dlg', [message], buttons));
}

/// if dirty, prompt for a save. Call the callback if the user saves or discards changes
export async function savePromptIfDirty(customEdition:CustomEditionType) {
    if (!initted) { init(); }
    if (customEdition.getDirty()) {
        return await showFn();
    }
    return true;
};

/// take down the popup
export function close(result:any) {
    if (!closeFn) { return; }
    closeFn(result);
}