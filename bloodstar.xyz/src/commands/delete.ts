/**
 * Code related to deleting files
 * @module Delete
 */
import { showError, show as showMessage } from '../dlg/blood-message-dlg';
import {spinner} from '../dlg/spinner-dlg';
import {show as getConfirmation} from "../dlg/yes-no-dlg";
import {chooseFile} from "../dlg/open-flow";
import signIn, { signedInCmd } from '../sign-in';
import { clearRecentFile } from '../recent-file';

type DeleteRequest = {token:string; saveName:string};
type DeleteResponse = {error:string}|true;

/** confirm deletion */
function confirmDelete(name:string):Promise<boolean> {
    return getConfirmation(
        'Confirm Delete',
        `Are you sure you'd like to delete "${name}"? This file will be lost forever!`,
        {
            yesLabel: `Yes, delete "${name}"`,
            noLabel:'Cancel',
            checkboxMessage:`Yes, I am certain I want to delete file "${name}"`,
        });
}

/**
 * Bring up a list of deletable files, and let the user delete from there
 * @returns promise that resolves to the name of the deleted file, or empty string if nothing was deleted
 */
export async function chooseAndDeleteFile():Promise<string> {
    const name = await chooseFile({message:'Choose an existing file to delete:', includeShared:false});
    if (!name) {return '';}

    // can't delete shared files
    if (Array.isArray(name)) {return '';}

    if (!await confirmDelete(name)) {return '';}
    if (!await spinner('delete', 'Choose file to delete', deleteFile(name))) {return '';}
    clearRecentFile(name);
    await showMessage(`Deleted`, `File "${name}" deleted`);
    return name;
}

/**
 * Run the server command to delete a file
 * @param name name of the file to open
 * @returns true if nothing went terribly wrong
 */
async function deleteFile(name:string):Promise<boolean> {
    const sessionInfo = await signIn({
        title:'Sign In to Delete',
        message:'You must be signed in to delete a file.'
    });
    if (!sessionInfo) {return false;}
    const deleteData:DeleteRequest = {
        token:sessionInfo.token,
        saveName: name
    };
    try {
        const response = await signedInCmd<DeleteResponse>('delete', `Deleting ${name}`, deleteData);
        if (response === true) {return true;}
        const {error} = response;
        await showError('Error', `Error encountered while trying to delete file ${name}`, error);
        return false;
    } catch (error: unknown) {
        await showError('Error', `Error encountered while trying to delete file ${name}`, error);
        return false;
    }
}
