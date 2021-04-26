// newfile/openfile dialog for bloodstar clocktica
import * as Bloodstar from '../bloodstar';
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'To get started, open an existing edition or create a new one.';
    
    const buttons:BloodDlg.ButtonCfg[] = [
        {label:'Open Existing', callback:Bloodstar.openFileClicked},
        {label:'Create New', callback:Bloodstar.newFileClicked}
    ];
    ;({open:showFn, close:closeFn} = BloodDlg.init('new-open-dlg', [message], buttons));
}

/**
 * bring up dialog for picking whether to open an existing file or start a new one
 * @returns promise that resolves to whether the dialog was successful
 */
export async function show():Promise<boolean> {
    if (!initted) { init(); }
    if (!showFn) { return false; }
    const result = await showFn();
    return !!result;
}

/// take down the popup
export function close(result:any) {
    if (!closeFn) { return; }
    closeFn(result);
}