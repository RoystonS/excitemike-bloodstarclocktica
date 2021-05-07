/**
 * confirmation dialog
 * @module YesNoDlg
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

class YesNoDialog extends AriaDialog<boolean> {
    async open(titleText:string, messageText?:string, yesLabel='Yes', noLabel='No'):Promise<boolean> {
        const body:CreateElementsOptions = [{
            t:'p',
            css:['title'],
            txt:titleText
        }];
        
        if (messageText) {
            body.push({t:'p', txt:messageText});
        }

        return !!await this.baseOpen(
            document.activeElement,
            'message',
            body,
            [
                {label:yesLabel, callback:() => Promise.resolve(true)},
                {label:noLabel, callback:() => Promise.resolve(false)}
            ]
        );
    }
}

/** bring up the confirmation dialog */
export async function show(titleText:string, messageText?:string, yesLabel='Yes', noLabel='No'):Promise<boolean> {
    return await new YesNoDialog().open(titleText, messageText, yesLabel, noLabel);
}
