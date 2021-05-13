/**
 * dialog for initial new/open prompt
 * @module NewOpenDlg
 */

import { CreateElementsOptions } from '../util';
import {AriaDialog, ButtonCfg} from './aria-dlg';
import {newFileClicked, openFileClicked} from '../bloodstar';

class NewOpenDlg extends AriaDialog<boolean> {
    canCancel():boolean{return false;}
    async open():Promise<boolean> {
        const body:CreateElementsOptions = [{
            t:'p',
            css:['title'],
            txt:'To get started, open an existing edition or create a new one.'
        }];
        const buttons:ButtonCfg<boolean>[] = [
            {label:'Open Existing', callback:openFileClicked},
            {label:'Create New', callback:newFileClicked}
        ];
        return !!await this.baseOpen(
            document.activeElement,
            'newopen',
            body,
            buttons
        );
    }
}

/**
 * bring up dialog for picking whether to open an existing file or start a new one
 * @returns promise that resolves to whether the dialog was successful
 */
export async function show():Promise<boolean> {
    return await new NewOpenDlg().open();
}