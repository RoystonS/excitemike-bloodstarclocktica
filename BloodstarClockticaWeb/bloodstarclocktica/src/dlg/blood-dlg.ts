/**
 * Prepares a dialog. Use to build custom dialogs. FSee other moduels in this folder for examples
 * @module
 */

type ResolveFn = (value:any)=>void;
type RejectFn = (error:any)=>void;
type ButtonCb = ()=>Promise<any>;
export type ButtonCfg = {label:string,callback:ButtonCb};
type DialogData = {
    resolve:ResolveFn,
    reject: RejectFn
};
const dialogData = new Map<Element, DialogData>();
const dialogIds = new Set<string>();

/** test if a dialog is open */
export function dialogOpen(elementInDialog:HTMLElement):boolean {
    const dialog = elementInDialog.closest('.dialogScrim');
    if (!dialog) { return false; }
    return dialogData.has(dialog);
}

/**
 * used internally to build the show function
 */
function openDialog(dialog:HTMLElement, resolve:ResolveFn, reject:RejectFn) {
    const data = dialogData.get(dialog);
    if (data) {
        data.reject('dialog closed prematurely');
    }
    dialog.style.display = 'flex';
    dialogData.set(dialog, {resolve, reject});
}

/**
 * call callback, close dialog and resolve the show function's 
 * promise with the callback's return value
 */
async function closeDialog_cb(dialog:HTMLElement, callback:ButtonCb) {
    closeDialogAsync(dialog, callback);
}

/**
 * close dialog and resolve the show function's
 * promise with the result of an async function
 */
async function closeDialogAsync(dialog:HTMLElement, callback:ButtonCb) {
    try {
        dialog.style.display = 'none';
        const data = dialogData.get(dialog);
        if (!data) { return; }
        data.resolve(await callback());
        dialogData.delete(dialog);
    } finally {
        closeDialogSync(dialog, null);
    }
}

/**
 * close dialog and resolve the show function's 
 * promise with the provided value
 */
function closeDialogSync(dialog:HTMLElement, result:any) {
    dialog.style.display = 'none';
    const data = dialogData.get(dialog);
    if (!data) { return; }
    data.resolve(result);
    dialogData.delete(dialog);
}

/**
 * given an htmlelement in the dialog, close the dialog and 
 * resolve the show function's promise with the provided value
 */
export function resolveDialog(element:HTMLElement, valueOrPromise:any) {
    const dialog = element.closest('.dialogScrim');
    if (!dialog) { return; }
    const data = dialogData.get(dialog);
    if (!data) { return; }
    dialogData.delete(dialog);
    if (dialog instanceof HTMLElement) {
        dialog.style.display = 'none';
    }
    data.resolve(valueOrPromise);
}

export type OpenFn = ()=>Promise<any>;
export type CloseFn = (result:any)=>void;
export type DialogFuncs = {open:OpenFn, close:CloseFn};

/**
 * prepare a dialog
 *
 * @param id css id for the dialog
 * @param body Array of elements to be added inside the dialog
 * @param buttons Array of Objects that look like {label:'someLabel', callback:someCallback}. used to create buttons
 *                The callback should return a promise, whose result will be used as the result of the dialog
 * @return an object containing:
 *            open: a function that you can call to open the popup `function openFn():Promise{...}`
 *            close: a function you can call to close the popup early `function closeFn(result):void{...}`
 */
export function init(id:string, body:HTMLElement[], buttons:ButtonCfg[]):DialogFuncs {
    if (dialogIds.has(id)) { throw new Error(`already made dialog with id "${id}"`); }
    const dialog = document.createElement('div');
    dialog.className = 'dialogScrim';
    dialog.id = id;
    dialog.style.display = 'none';

    const box = document.createElement('div');
    box.className = 'dialogBox';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'dialogBtnGroup';

    // create buttons
    for (const {label, callback} of buttons) {
        const btn = document.createElement('button');
        btn.addEventListener('click', async () => await closeDialog_cb(dialog, callback) );
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

    const funcs:DialogFuncs = {
        open: () => new Promise((resolve, reject)=>openDialog(dialog, resolve, reject)),
        close: (result: any) => closeDialogSync(dialog, result)
    };

    dialogIds.add(id);

    return funcs;
}