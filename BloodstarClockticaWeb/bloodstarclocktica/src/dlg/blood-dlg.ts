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
    let value:any = null;
    try {
        value = await callback();
    } finally {
        closeDialog(dialog, value);
    }
}

/**
 * close dialog and resolve the show function's 
 * promise with the provided value
 */
function closeDialog(dialog:HTMLElement, result:any) {
    const data = dialogData.get(dialog);
    if (!data) { return; }
    dialogData.delete(dialog);
    dialog.style.display = 'none';
    data.resolve(result);
}

/**
 * given an htmlelement in the dialog, close the dialog and 
 * resolve the show function's promise with the provided value
 */
export function resolveDialog(element:HTMLElement, valueOrPromise:any) {
    const dialog = element.closest('.dialog-scrim');
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
 * @return an array containing:
 *            0: a function that you can call to open the popup `function openFn():Promise{...}`
 *            1: a function you can call to close the popup early `function closeFn(result):void{...}`
 */
export function init(id:string, body:HTMLElement[], buttons:ButtonCfg[]):DialogFuncs {
    if (dialogIds.has(id)) { throw new Error(`already made dialog with id "${id}"`); }
    const dialog = document.createElement('div');
    dialog.className = 'dialog-scrim';
    dialog.id = id;
    dialog.style.display = 'none';

    const box = document.createElement('div');
    box.className = 'dialog-box';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'dialog-btn-group';

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
        close: (result: any) => closeDialog(dialog, result)
    };

    dialogIds.add(id);

    return funcs;
}