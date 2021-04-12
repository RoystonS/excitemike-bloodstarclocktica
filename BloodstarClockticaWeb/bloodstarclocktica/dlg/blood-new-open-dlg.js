// newfile/openfile dialog for bloodstar clocktica
import * as BloodDlg from './blood-dlg.js';
import * as BloodOpenDlg from './blood-open-dlg.js';

let initted = false;
let showFn = null;

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
function createNew() {
    return {newName:'New Edition'};
}

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'To get started, open an existing edition or create a new one.';
    
    const buttons = [
        ['Open Existing', openExisting],
        ['Create New', createNew]
    ];
    showFn = BloodDlg.init('new-open-dlg', [message], buttons);
}

/// bring up dialog for picking whether to open an existing file or start a new one
/// returns a promise that resolves to an object like one of these:
///   {'open': <name>}
///   {'new': <name>}
export async function show() {
    if (!initted) { init(); }
    return await showFn();
}