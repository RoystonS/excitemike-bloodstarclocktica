/**
 * dialog for initial new/open prompt
 * @module SaveDiscardCancelDlg
 */
import { save } from '../commands/save';
import { Edition } from '../model/edition';
import {CreateElementsOptions} from '../util';
import {AriaDialog, ButtonCfg} from './aria-dlg';

class SaveDiscardCancelDlg extends AriaDialog<boolean> {
    async open(edition:Edition):Promise<boolean>{
        const body:CreateElementsOptions = [{
            t:'h1',
            txt:'Unsaved Changes'
        },{
            t:'p',
            txt:'You have unsaved changes! Would you like to save now or discard them?'
        }];
        const buttons:ButtonCfg<boolean>[] = [
            {label:'Save', callback:async ()=>await save(edition)},
            {label:'Discard', callback:()=>true},
            {label:'Cancel', callback:()=>false},
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
        return !!await new SaveDiscardCancelDlg().open(edition);
    }
    return true;
}