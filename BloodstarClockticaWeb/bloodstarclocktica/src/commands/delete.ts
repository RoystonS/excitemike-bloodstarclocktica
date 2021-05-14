/**
 * Code related to deleting files
 * @module Delete
 */
import { show as showMessage, showError } from '../dlg/blood-message-dlg';
import {show as showOpenDlg} from '../dlg/blood-open-dlg';
import {spinner} from '../dlg/spinner-dlg';
import {show as getConfirmation} from "../dlg/yes-no-dlg";
import cmd from './cmd';

type SaveData = {saveName:string};
type DeleteReturn = {success:true,error?:string};

/**
 * Bring up a list of deletable files, and let the user delete from there
 * @param username login credentials
 * @param password login credentials
 * @returns promise that resolves to the name of the deleted file, or empty string if nothing was deleted
 */
 export async function chooseAndDeleteFile(username:string, password:string):Promise<string> {
    const name = await showOpenDlg(username, password);
    if (!name) {return '';}
    if (!await getConfirmation('Confirm Delete', `Are you sure you'd like to delete "${name}"? This file will be lost forever!`)) {return '';}
    if (!await spinner('delete', 'Choose file to delete', deleteFile(username, password, name))){return '';}
    await showMessage(`File "${name}" deleted`);
    return name;
}

/**
 * Run the server command to delete a file
 * @param username login credentials
 * @param password login credentials
 * @param name name of the file to open
 * @returns true if nothing went terribly wrong
 */
async function deleteFile(username:string, password:string, name:string):Promise<boolean>{
    const deleteData:SaveData = {
        saveName: name
    };
    const payload = JSON.stringify(deleteData);
    try {
        const {error} = await cmd(username, password, 'delete', `Deleting ${name}`, payload) as DeleteReturn;
        if (error) {
            await showError('Error', `Error encountered while trying to delete file ${name}`, error);
            return false;
        }
    } catch (error) {
        await showError('Error', `Error encountered while trying to delete file ${name}`, error);
        return false
    }
    return true;
}
