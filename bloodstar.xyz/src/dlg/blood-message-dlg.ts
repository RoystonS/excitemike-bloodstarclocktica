/**
 * dialog to prompt for a string
 * @module MessageDlg
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

class MessageDialog extends AriaDialog<void> {
    open(focusAfterClose:Element|string|null, titleText:string, messageText?:string, errorMessage?:string):Promise<void|null> {
        const body:CreateElementsOptions = [{
            t:'h1',
            txt:titleText
        }];
        
        if (messageText) {
            body.push({t:'p', txt:messageText});
        }
        
        if (errorMessage) {
            body.push({t:'pre', txt:errorMessage});
        }

        return this.baseOpen(
            focusAfterClose,
            'message',
            body,
            [{label:'OK'}]
        );
    }
}

/**
 * bring up the popup showing exception information
 */
export function showError(
            title = 'Error',
            message = 'It looks like you encountered a bug! The error message below may help the developers fix it.',
            error:Error|unknown = undefined
        ):Promise<void|null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = (error instanceof Error) ? `${error.message}` : (error as any).toString();
    return new MessageDialog().open(document.activeElement, title, message, errorMessage);
}

/**
 * bring up the popup showing a message
 */
export function show(titleText:string, messageText?:string):Promise<void|null> {
    return new MessageDialog().open(document.activeElement, titleText, messageText);
}
