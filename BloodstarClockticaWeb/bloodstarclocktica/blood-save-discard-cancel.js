import * as Bloodstar from './bloodstar.js';

let dialog = null;
let savedContinueCb = null;

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

function savePrompt(continueCb) {
    savedContinueCb = continueCb;
    dialog.style.display = 'flex';
}

/// one-time initialization
export function init() {
    dialog = document.createElement('div');
    dialog.id = 'save-discard-cancel';

    const box = document.createElement('div');
    box.id = 'sdc-box';
    box.innerHTML = 'You have unsaved changes!<p>Would you like to save now or discard them?</p>';

    const btnGroup = document.createElement('div');
    btnGroup.id = 'sdc-btn-group';

    const saveBtn = document.createElement('button');
    saveBtn.addEventListener('click', sdcSaveClicked);
    saveBtn.innerText = 'Save';
    const discardBtn = document.createElement('button');
    discardBtn.addEventListener('click', sdcDiscardClicked);
    discardBtn.innerText = 'Discard';
    const cancelBtn = document.createElement('button');
    cancelBtn.addEventListener('click', sdcCancelClicked);
    cancelBtn.innerText = 'Cancel';
    
    btnGroup.appendChild(saveBtn);
    btnGroup.appendChild(discardBtn);
    btnGroup.appendChild(cancelBtn);
    box.appendChild(btnGroup);
    dialog.appendChild(box);
    document.body.appendChild(dialog);
}

/// if document is dirty, prompt for a save. Call the callback if the user saves or discards changes
export function savePromptIfDirty() {
    let bloodDocument = Bloodstar.getDocument();
    if (bloodDocument.dirty.get()) {
        return savePrompt();
    }
    return Promise.resolve();
};

// wait for dom to load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    // `DOMContentLoaded` already fired
    init();
}