/**
 * Code related to deleting files
 * @module Delete
 */
import { show as showMessage, showError } from '../dlg/blood-message-dlg';
import {spinner} from '../dlg/spinner-dlg';
import {show as getConfirmation} from "../dlg/yes-no-dlg";
import {chooseFile} from "../dlg/open-flow";
import signIn, { signedInCmd } from '../sign-in';

type DeleteData = {token:string,saveName:string};
type DeleteReturn = {error:string}|true;

/** confirm deletion */
async function confirmDelete(name:string):Promise<boolean> {
    return await getConfirmation(
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
    // TODO: this needs to tell you it is for deletion, not open
    const name = await chooseFile();
    if (!name) {return '';}
    if (!await confirmDelete(name)) {return '';}
    if (!await spinner('delete', 'Choose file to delete', deleteFile(name))){return '';}
    await showMessage(`Deleted`, `File "${name}" deleted`);
    return name;
}

/**
 * Run the server command to delete a file
 * @param name name of the file to open
 * @returns true if nothing went terribly wrong
 */
async function deleteFile(name:string):Promise<boolean>{
    // TODO: more specific title
    const sessionInfo = await signIn();
    if (!sessionInfo){return false;}
    const deleteData:DeleteData = {
        token:sessionInfo.token,
        saveName: name
    };
    try {
        const response = await signedInCmd('delete', `Deleting ${name}`, deleteData) as DeleteReturn;
        if (true === response) {return true;}
        const {error} = response;
        await showError('Error', `Error encountered while trying to delete file ${name}`, error);
        return false;
    } catch (error) {
        await showError('Error', `Error encountered while trying to delete file ${name}`, error);
        return false
    }
}
