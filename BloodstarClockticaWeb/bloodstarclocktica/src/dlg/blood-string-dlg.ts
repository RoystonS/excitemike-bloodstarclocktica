/**
 * dialog to prompt for a string
 * @module StringDlg
 */
import {ButtonCfg, AriaDialog} from './aria-dlg';


class StringDialog extends AriaDialog<string> {
    async open(prompt:string, defaultValue:string, validation?:{pattern:string,hint?:string, sanitizeFn?:(inStr:string)=>string}):Promise<string|null> {
        const body = [];
        const sanitizeFn = (validation && validation.sanitizeFn) ? validation.sanitizeFn : null;

        {
            const messageArea = document.createElement('span');
            messageArea.innerText = prompt;
            messageArea.setAttribute('role', 'alert');
            body.push(messageArea);
        }

        const inputBox = document.createElement('input');
        {
            inputBox.type = 'text';
            inputBox.required = true;
            inputBox.value = defaultValue;
            inputBox.pattern = (validation && validation.pattern) ? validation.pattern : '';
            inputBox.title = (validation && validation.hint) ? validation.hint : '';
            if (sanitizeFn) {
                inputBox.addEventListener('change', _=>{
                    if (inputBox && !inputBox.validity.valid) {
                        inputBox.value = sanitizeFn(inputBox.value);
                    }
                });
            }
            body.push(inputBox);
        }
        
        const buttons:ButtonCfg[] = [
            {label:'Ok', callback:() => Promise.resolve(inputBox ? inputBox.value : null)},
            {label:'Cancel', callback:() => Promise.resolve(null)}
        ];

        return await this.baseOpen(
            document.activeElement,
            'string',
            body,
            buttons
        );
    }
}

/**
 * bring up the popup asking the user for a string
 * returns a promise that resolves to the entered
 * string or null if the user cancelled
 */
export async function show(prompt:string, defaultValue:string, validation?:{pattern:string,hint?:string,sanitizeFn?:(inStr:string)=>string}):Promise<string|null> {
    return new StringDialog().open(prompt, defaultValue, validation);
}