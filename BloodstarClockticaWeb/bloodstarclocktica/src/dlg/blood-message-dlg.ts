///! dialog to prompt for a string
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let titleElement:HTMLElement|null = null;
let messageElement:HTMLElement|null = null;
let errorMessageElement:HTMLElement|null = null;
let count = 0;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    titleElement = document.createElement('p');
    titleElement.classList.add('title');
    messageElement = document.createElement('p');
    errorMessageElement = document.createElement('pre');
    
    const buttons:BloodDlg.ButtonCfg[] = [
        {label:'Ok', callback:() => Promise.resolve(null)}
    ];
    ;({open:showFn, close:closeFn} = BloodDlg.init('message-dlg', [titleElement, messageElement, errorMessageElement], buttons));
}

/**
 * bring up the popup showing a message
 */
async function _show(titleText:string, messageText?:string, errorMessage?:string):Promise<void> {
    ++count;
    // TODO: make a queue
    if (count !== 1) { throw new Error('overlapping message dialogs is not currently supported!');}
    if (!initted) { init(); }
    if (!(showFn && titleElement && messageElement && errorMessageElement)) { return; }

    messageElement.style.display = messageText ? 'initial' : 'none';
    errorMessageElement.style.display = errorMessage ? 'initial' : 'none';

    titleElement.innerText = titleText;
    messageElement.innerText = messageText || '';
    errorMessageElement.innerText = errorMessage || '';

    return await showFn();
}

/**
 * bring up the popup showing exception information
 */
export async function showError(error:any):Promise<void> {
    const errorMessage = (error instanceof Error) ? `${error.message}\n\n${error.stack}` : error.toString();
    return await _show('Error', 'It looks like you encountered a bug! The error message below may help the developers fix it.', errorMessage);
}
/**
 * bring up the popup showing a message
 */
export async function show(titleText:string, messageText?:string):Promise<void> {
    ++count;
    return await _show(titleText, messageText);
}

/// close the popup early
export function close(result:any):void {
    --count;
    if (!closeFn) { return; }
    closeFn(result);
}