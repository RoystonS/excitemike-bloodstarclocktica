/**
 * confirmation dialog
 * @module YesNoDlg
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

export type YesNoOptions = {
    /** how to label the Yes button. default: 'Yes' */
    yesLabel?:string,
    /** how to label the No button. default: 'No' */
    noLabel?:string,
    /**
     * Label to place on the checkbox. 
     * If present and not empty, a checkbox is present and must be checked in order for the dialog to result in true.
     * If not present or empty, no checkbox appears
     */
     checkboxMessage?:string
};

class YesNoDialog extends AriaDialog<boolean> {
    async open(titleText:string, messageText?:string, options?:YesNoOptions):Promise<boolean> {
        const yesLabel = options?.yesLabel || 'Yes';
        const noLabel = options?.noLabel || 'No';
        const checkboxMessage = options?.checkboxMessage || '';

        const body:CreateElementsOptions = [{
            t:'h1',
            txt:titleText
        }];
        
        if (messageText) {
            body.push({t:'p', txt:messageText});
        }

        if (checkboxMessage) {
            const syncToButton = ():void=>{
                const checkboxElem = this.querySelector<HTMLInputElement>('#confirmCheckbox');
                if (!checkboxElem) {return;}
                const buttonElem = this.querySelector<HTMLButtonElement>('#yesLabel');
                if (!buttonElem) {return;}
                buttonElem.disabled = !checkboxElem.checked;
            };
            body.push({t:'div',css:['twoColumnGrid'],children:[
                {
                    t:'input',
                    a:{type:'checkbox',id:'confirmCheckbox',name:'confirmCheckbox'},
                    events:{change:syncToButton}
                },
                {t:'label',a:{'for':'confirmCheckbox'},txt:checkboxMessage}
            ]});
        }

        const yesCallback = ():boolean=>{
            if (!checkboxMessage) return true;
            const checkboxElem = this.querySelector<HTMLInputElement>('#confirmCheckbox');
            if (!checkboxElem) {return false;}
            return checkboxElem.checked;
        };

        return !!await this.baseOpen(
            document.activeElement,
            'message',
            body,
            [
                {label:yesLabel,id:'yesLabel',callback:yesCallback,disabled:!!checkboxMessage},
                {label:noLabel, callback:() => false}
            ]
        );
    }
}

/** bring up the confirmation dialog */
export async function show(titleText:string, messageText?:string, options?:YesNoOptions):Promise<boolean> {
    return await new YesNoDialog().open(titleText, messageText, options);
}
