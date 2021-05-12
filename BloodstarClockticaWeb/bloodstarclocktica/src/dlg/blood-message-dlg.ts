/**
 * dialog to prompt for a string
 * @module MessageDlg
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

interface ToStringable {
    toString():string;
}

class MessageDialog extends AriaDialog<void> {
    async open(focusAfterClose:Element|string|null, titleText:string, messageText?:string, errorMessage?:string):Promise<void|null> {
        const body:CreateElementsOptions = [{
            t:'p',
            css:['title'],
            txt:titleText
        }];
        
        if (messageText) {
            body.push({t:'p', txt:messageText});
        }
        
        if (errorMessage) {
            body.push({t:'pre', txt:errorMessage});
        }

        return await this.baseOpen(
            focusAfterClose,
            'message',
            body,
            [{label:'OK', callback:() => Promise.resolve(null)}]
        );
    }
}

/**
 * bring up the popup showing exception information
 */
export async function showError(title:string, message:string, error?:Error|ToStringable):Promise<void|null> {
    title = title || 'Error';
    message = message || 'It looks like you encountered a bug! The error message below may help the developers fix it.';
    const errorMessage = (error instanceof Error) ? `${error.message}` : (error && error.toString());
    return await new MessageDialog().open(document.activeElement, title, message, errorMessage);
}

/**
 * bring up the popup showing a message
 */
export async function show(titleText:string, messageText?:string):Promise<void|null> {
    return await new MessageDialog().open(document.activeElement, titleText, messageText);
}
