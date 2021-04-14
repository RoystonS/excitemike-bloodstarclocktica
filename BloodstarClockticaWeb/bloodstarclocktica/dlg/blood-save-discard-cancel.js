import * as Bloodstar from '../bloodstar.js';
import * as BloodDlg from './blood-dlg.js';

let initted = false;
let showFn = null;
let closeFn = null;

function addToRecentDocuments() {
    
}
function updateNightOrder() {
    
}

export function doSaveAs(saveId, continueCb) {
    addToRecentDocuments();
    updateNightOrder();
    return Bloodstar
        .getDocument()
        .save();
}

export function doSave(continueCb) {
    addToRecentDocuments();
    updateNightOrder();
    return Bloodstar
        .getDocument()
        .save();
}

function sdcSaveClicked(e) {
    const bloodDocument = Bloodstar.getDocument();
    const oldName = bloodDocument.meta.name.get();
    dialog.style.display = 'none';
    const backup = savedContinueCb;
    savedContinueCb = null;
    doSave(backup);
}

function sdcDiscardClicked(e) {
    dialog.style.display = 'none';
    const backup = savedContinueCb;
    savedContinueCb = null;
    backup();
}

function sdcCancelClicked(e) {
    dialog.style.display = 'none';
}

/// one-time initialization
export function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'You have unsaved changes! Would you like to save now or discard them?';

    const buttons = [
        ['Save', sdcSaveClicked],
        ['Discard', sdcDiscardClicked],
        ['Cancel', sdcCancelClicked],
    ];
    [showFn, closeFn] = BloodDlg.init('sdc-dlg', [message], buttons);
}

/// if document is dirty, prompt for a save. Call the callback if the user saves or discards changes
export async function savePromptIfDirty() {
    if (!initted) { init(); }
    const bloodDocument = Bloodstar.getDocument();
    if (bloodDocument.dirty.get()) {
        return await showFn();
    }
    return true;
};
