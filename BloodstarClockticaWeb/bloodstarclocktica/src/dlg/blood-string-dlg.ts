///! dialog to prompt for a string
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let messageArea:HTMLElement|null = null;
let inputBox:HTMLInputElement|null = null;
let sanitizeFn:((inStr:string)=>string)|null = null;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    messageArea = document.createElement('span');
    inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.required = true;
    inputBox.addEventListener('change', inputBoxChanged);
    
    const buttons:BloodDlg.ButtonCfg[] = [
        {label:'Ok', callback:() => Promise.resolve(inputBox ? inputBox.value : null)},
        {label:'Cancel', callback:() => Promise.resolve(null)}
    ];
    [showFn, closeFn] = BloodDlg.init('string-dlg', [messageArea, inputBox], buttons);
}

/**
 * validate the input box
 * @param _e 
 */
function inputBoxChanged(_e:Event):void {
    if (inputBox && !inputBox.validity.valid && sanitizeFn) {
        inputBox.value = sanitizeFn(inputBox.value);
    }
}

/// bring up the popup asking the user for a string
/// returns a promise that resolves to the entered
/// string or null if the user cancelled
export async function show(prompt:string, defaultName:string, validation?:{pattern:string,hint?:string,sanitizeFn?:(inStr:string)=>string}):Promise<string|null> {
    if (!initted) { init(); }
    if (!showFn) { return Promise.resolve(null); }
    if (!messageArea) { return Promise.resolve(null); }
    if (!inputBox) { return Promise.resolve(null); }

    messageArea.innerText = prompt;
    inputBox.value = defaultName;

    inputBox.pattern = (validation && validation.pattern) ? validation.pattern : '';
    inputBox.title = (validation && validation.hint) ? validation.hint : '';
    sanitizeFn = (validation && validation.sanitizeFn) ? validation.sanitizeFn : null;

    return await showFn();
}

/// close the popup early
export function close(result:any):void {
    sanitizeFn = null;
    if (!closeFn) { return; }
    closeFn(result);
}