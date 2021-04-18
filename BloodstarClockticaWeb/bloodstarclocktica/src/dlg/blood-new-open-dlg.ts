// newfile/openfile dialog for bloodstar clocktica
import * as BloodDlg from './blood-dlg';
import * as BloodOpenDlg from './blood-open-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;

/// user chose to open an existing file
async function openExisting() {
    const result = await BloodOpenDlg.show();
    // if cancelled, do another new-open dialog
    if (!result) {
        return await show();
    }
    return {openName:result};
}

/// user chose to create a new file
function createNew():Promise<any> {
    return Promise.resolve({newName:'New Edition'});
}

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'To get started, open an existing edition or create a new one.';
    
    const buttons:BloodDlg.ButtonCfg[] = [
        {label:'Open Existing', callback:openExisting},
        {label:'Create New', callback:createNew}
    ];
    [showFn, closeFn] = BloodDlg.init('new-open-dlg', [message], buttons);
}

/// bring up dialog for picking whether to open an existing file or start a new one
/// returns a promise that resolves to an object like one of these:
///   {'open': <name>}
///   {'new': <name>}
export async function show() {
    if (!initted) { init(); }
    if (!showFn) { return; }
    return await showFn();
}

/// take down the popup
export function close(result:any) {
    if (!closeFn) { return; }
    closeFn(result);
}