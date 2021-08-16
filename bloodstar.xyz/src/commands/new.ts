/**
 * reset to new edition
 * @module New
 */
import {Edition} from '../model/edition';
import * as SdcDlg from '../dlg/blood-save-discard-cancel';

/// prompt for save if needed, then reset to new custom edition
export async function newEdition(edition:Edition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        await edition.reset();
        return true;
    }
    return false;
}