/**
 * dialog to prompt for a string
 * @module MessageDlg
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

class MessageDialog extends AriaDialog<void> {
    async open(focusAfterClose:Element|string|null, titleText:string, messageText?:string, errorMessage?:string):Promise<null> {
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

        await this.baseOpen(
            focusAfterClose,
            'message',
            body,
            [{ label: 'OK' }]
        );
        return null;
    }
}

/**
 * bring up the popup showing exception information
 */
export function showError(
    title = 'Error',
    message = 'It looks like you encountered a bug! The error message below may help the developers fix it.',
    error:Error|unknown = undefined
):Promise<null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = (error instanceof Error) ? `${error.message}` : `${error}`;
    return new MessageDialog().open(document.activeElement, title, message, errorMessage);
}
/**
 * bring up the popup showing exception information
 */
export function showErrorNoWait(
    title = 'Error',
    message = 'It looks like you encountered a bug! The error message below may help the developers fix it.',
    error:Error|unknown = undefined
):void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    showError(title, message, error);
}

/**
 * bring up the popup showing a message
 */
export function show(titleText:string, messageText?:string):Promise<null> {
    return new MessageDialog().open(document.activeElement, titleText, messageText);
}

/**
 * bring up the popup showing a message
 */
export function showNoWait(titleText:string, messageText?:string):void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    show(titleText, messageText);
}
