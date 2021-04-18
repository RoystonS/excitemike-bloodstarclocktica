import * as Bloodstar from '../bloodstar';
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn = ()=>Promise.resolve(null);
let closeFn:BloodDlg.CloseFn = _=>{};

function addToRecentDocuments() {
    
}
function updateNightOrder() {
    
}

/// save the current document under a new name
export function doSaveAs(saveId:string):Promise<boolean> {
    updateNightOrder();
    const result =  Bloodstar
        .getDocument()
        .saveAs(saveId);
    if (result) {
        addToRecentDocuments();
    }
    return result;
}

export async function doSave():Promise<boolean> {
    updateNightOrder();
    const result = await Bloodstar
        .getDocument()
        .save();
    if (result) {
        addToRecentDocuments();
    }
    return result;
}

async function sdcSaveClicked():Promise<boolean> {
    return await doSave();
}

async function sdcDiscardClicked():Promise<boolean> {
    return true;
}

async function sdcCancelClicked():Promise<boolean> {
    return false;
}

/// one-time initialization
export function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'You have unsaved changes! Would you like to save now or discard them?';

    const buttons = [
        {label:'Save', callback:sdcSaveClicked},
        {label:'Discard', callback:sdcDiscardClicked},
        {label:'Cancel', callback:sdcCancelClicked},
    ];
    [showFn, closeFn] = BloodDlg.init('sdc-dlg', [message], buttons);
}

/// if document is dirty, prompt for a save. Call the callback if the user saves or discards changes
export async function savePromptIfDirty() {
    if (!initted) { init(); }
    const bloodDocument = Bloodstar.getDocument();
    if (bloodDocument.getDirty()) {
        return await showFn();
    }
    return true;
};

/// take down the popup
export function close(result:any) {
    if (!closeFn) { return; }
    closeFn(result);
}