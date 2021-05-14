/**
 * dialog to prompt for a string
 * @module StringDlg
 */
import { CreateElementsOptions } from '../util';
import {ButtonCfg, AriaDialog} from './aria-dlg';


class StringDialog extends AriaDialog<string> {
    async open(prompt:string, defaultValue:string, validation?:{pattern:string,hint?:string, sanitizeFn?:(inStr:string)=>string}):Promise<string|null> {
        let enteredString = defaultValue;

        const submitOnEnter = (event:KeyboardEvent):void=>{
            switch (event.code)
            {
                case 'NumpadEnter':
                case 'Enter':
                    event.preventDefault();
                    this.close(enteredString);
                    break;
            }
        };
        
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
            events: {
                change:((event:Event)=>{
                    if (!(event.target instanceof HTMLInputElement)){return;}
                    if (validation && validation.sanitizeFn) {
                        event.target.value = validation.sanitizeFn(event.target.value);
                    }
                    enteredString = event.target.value;
                }),
                keyup:submitOnEnter as EventListener}
        }];
        
        const buttons:ButtonCfg<string|null>[] = [
            {label:'OK', callback:() => enteredString},
            {label:'Cancel'}
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
export async function show(prompt:string, defaultValue='', validation?:{pattern:string,hint?:string,sanitizeFn?:(inStr:string)=>string}):Promise<string|null> {
    return await new StringDialog().open(prompt, defaultValue, validation);
}