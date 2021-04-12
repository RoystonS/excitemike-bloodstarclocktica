const dialogData = new Map();


/// show the dialog, store promise callbacks
function openDialog(dialog, resolve, reject) {
    if (dialogData.has(dialog)) {
        const {reject} = dialogData.get(dialog);
        reject('dialog closed prematurely');
    }
    dialog.style.display = 'flex';
    dialogData.set(dialog, {resolve, reject});
}

/// resolve promise and hide the dialog
function closeDialog(dialog, callback) {
    const {resolve} = dialogData.get(dialog);
    dialogData.delete(dialogData);
    dialog.style.display = 'none';
    resolve(callback());
}

/// resolve the current dialog
export function resolveDialog(element, valueOrPromise) {
    const dialog = element.closest('.dialog-scrim');
    const {resolve} = dialogData.get(dialog);
    dialogData.delete(dialogData);
    dialog.style.display = 'none';
    resolve(valueOrPromise);
}

/// prepare a dialog
/// 
/// id - css id for the dialog
/// body - Array of elements to be added inside the dialog
/// buttons - Array of Arrays that look like ['someLabel', someCallback]. used to create buttons
///           The callback should return a promise, whose result will be used as the result of the dialog
/// return - a function that you can call to open the popup
///          that function returns a promise that resolves to the popup result
export function init(id, body, button) {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-scrim';
    dialog.id = id;
    dialog.style.display = 'none';

    const box = document.createElement('div');
    box.className = 'dialog-box';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'dialog-btn-group';

    // create buttons
    for (const [label, callback] of button) {
        const btn = document.createElement('button');
        btn.addEventListener('click', () => closeDialog(dialog, callback) );
        btn.innerText = label;
        btnGroup.appendChild(btn);
    }

    // add body elements to box
    for (const element of body) {
        box.appendChild(element);
    }

    // followed by buttons
    box.appendChild(btnGroup);

    // box in dlg, dlg in document.
    dialog.appendChild(box);
    document.body.appendChild(dialog);

    return () => new Promise((resolve, reject)=>openDialog(dialog, resolve, reject));
}