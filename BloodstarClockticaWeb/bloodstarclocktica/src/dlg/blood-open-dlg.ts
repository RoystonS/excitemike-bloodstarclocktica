/**
 * prompt for opening a file
 * @module OpenDlg
 */
import {createElement, CreateElementsOptions} from '../util';
import {AriaDialog} from './aria-dlg';
import {listFiles} from '../blood-io';

class OpenDlg extends AriaDialog<string> {
    /**
     * @param auth base64'd `${username}:${password}`
     */
    async open(auth:string):Promise<string|null> {
        const fileListDiv = createElement({t:'div',css:['openDlgList']});
        const body:CreateElementsOptions = [
            {t:'p',txt:'Choose an existing file to open:'},
            fileListDiv
        ];

        const files = await listFiles(auth);
        if (!files) {return null;}
        if (files.length) {
            for (const name of files) {
                const button = createElement({t:'button',txt:name,events:{click:()=>this.close(name)}});
                fileListDiv.appendChild(button);
            }
        } else {
            fileListDiv.appendChild(createElement({t:'p',txt:'No files found.',a:{role:'alert'}}));
        }
        
        return await this.baseOpen(
            document.activeElement,
            'open',
            body,
            [{label:'Cancel'}]
        );
    }
}

/**
 * bring up dialog for picking whether to open an existing file or start a new one
 * returns a promise that resolves to a name, or null if the dialog was cancelled
 * @param auth base64'd `${username}:${password}`
 */
export async function show(auth:string):Promise<string|null> {
    return await new OpenDlg().open(auth);
}
