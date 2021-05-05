/**
 * dialog for initial new/open prompt
 * @module SaveDiscardCancelDlg
 */
import { Edition } from '../model/edition';
import {CreateElementsOptions} from '../util';
import {AriaDialog, ButtonCfg} from './aria-dlg';
import {saveFileClicked} from '../bloodstar';

class SaveDiscardCancelDlg extends AriaDialog<boolean> {
    async open():Promise<boolean>{
        const body:CreateElementsOptions = [{
            t:'p',
            txt:'You have unsaved changes! Would you like to save now or discard them?'
        }];
        const buttons:ButtonCfg[] = [
            {label:'Save', callback:async ()=>await saveFileClicked()},
            {label:'Discard', callback:async ()=>Promise.resolve(true)},
            {label:'Cancel', callback:async ()=>Promise.resolve(false)},
        ];
        return !!await this.baseOpen(
            document.activeElement,
            'savediscardcancel',
            body,
            buttons
        );
    }
}

/**
 * if dirty, prompt for a save.
 * @param edition 
 * @returns promise that resolves to true if the user did not cancel
 */
export async function savePromptIfDirty(edition:Edition):Promise<boolean> {
    if (edition.dirty.get()) {
        return !!await new SaveDiscardCancelDlg().open();
    }
    return true;
}