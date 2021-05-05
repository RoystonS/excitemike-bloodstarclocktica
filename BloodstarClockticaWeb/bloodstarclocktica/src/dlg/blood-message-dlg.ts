/**
 * dialog to prompt for a string
 * @module MessageDlg
 */
import {AriaDialog} from './aria-dlg';

class MessageDialog extends AriaDialog<void> {
    async open(focusAfterClose:Element|string|null, titleText:string, messageText?:string, errorMessage?:string):Promise<void|null> {
        const body = [];

        {
            const titleElement = document.createElement('p');
            titleElement.classList.add('title');
            titleElement.innerText = titleText;
            body.push(titleElement);
        }

        if (messageText) {
            const messageElement = document.createElement('p');
            messageElement.innerText = messageText;
            body.push(messageElement);
        }

        if (errorMessage) {
            const errorMessageElement = document.createElement('pre');
            errorMessageElement.innerText = errorMessage;
            body.push(errorMessageElement);
        }

        return await this.baseOpen(
            focusAfterClose,
            'message',
            body,
            [{label:'Ok', callback:() => Promise.resolve(null)}]
        );
    }
}

/**
 * bring up the popup showing exception information
 */
export async function showError(error:any):Promise<void|null> {
    const errorMessage = (error instanceof Error) ? `${error.message}\n\n${error.stack}` : error.toString();
    return new MessageDialog().open(document.activeElement, 'Error', 'It looks like you encountered a bug! The error message below may help the developers fix it.', errorMessage);
}

/**
 * bring up the popup showing a message
 */
export async function show(titleText:string, messageText?:string):Promise<void|null> {
    return new MessageDialog().open(document.activeElement, titleText, messageText);
}
