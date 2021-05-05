/**
 * dialog to prompt for a string
 * @module StringDlg
 */
import { CreateElementsOptions } from '../util';
import {ButtonCfg, AriaDialog} from './aria-dlg';


class StringDialog extends AriaDialog<string> {
    async open(prompt:string, defaultValue:string, validation?:{pattern:string,hint?:string, sanitizeFn?:(inStr:string)=>string}):Promise<string|null> {
        let enteredString = '';
        
        const body:CreateElementsOptions = [{
            t:'span',
            a:{role:'alert'},
            txt:prompt
        },{
            t:'input',
            a:{
                required:'true',
                type:'text',
                value:defaultValue,
                pattern:(validation && validation.pattern) ? validation.pattern : '',
                title:(validation && validation.hint) ? validation.hint : ''
            },
            events: {change:((event:Event)=>{
                if (!(event.target instanceof HTMLInputElement)){return;}
                if (validation && validation.sanitizeFn) {
                    event.target.value = validation.sanitizeFn(event.target.value);
                }
                enteredString = event.target.value;
            })}
        }];
        
        const buttons:ButtonCfg[] = [
            {label:'Ok', callback:() => Promise.resolve(enteredString)},
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