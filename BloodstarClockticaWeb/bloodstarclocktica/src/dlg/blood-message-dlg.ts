///! dialog to prompt for a string
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let nameArea:HTMLElement|null = null;
let messageArea:HTMLElement|null = null;
let stackArea:HTMLElement|null = null;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    nameArea = document.createElement('p');
    messageArea = document.createElement('p');
    stackArea = document.createElement('pre');
    
    const buttons:BloodDlg.ButtonCfg[] = [
        {label:'Ok', callback:() => Promise.resolve(null)}
    ];
    ;({open:showFn, close:closeFn} = BloodDlg.init('message-dlg', [nameArea, messageArea, stackArea], buttons));
}

/**
 * bring up the popup showing a message
 */
export async function show(name:string, message?:string, stack?:string):Promise<string|null> {
    if (!initted) { init(); }
    if (!(showFn && nameArea && messageArea && stackArea)) { return null; }

    nameArea.innerText = name;
    messageArea.style.display = message ? 'initial' : 'none';
    messageArea.innerText = message ? message : '';
    stackArea.style.display = stack ? 'initial' : 'none';
    stackArea.innerText = stack ? stack : '';

    return await showFn();
}

/**
 * bring up the popup showing exception information
 */
export async function showError(error:any):Promise<string|null> {
    if (error instanceof Error) {
        return await show(error.name, error.message, error.stack);
    } else {
        return await show(error.toString());
    }
}

/// close the popup early
export function close(result:any):void {
    if (!closeFn) { return; }
    closeFn(result);
}