import {Edition, EditionSaveData} from './model/edition';
import * as Spinner from './dlg/spinner-dlg';
import * as MessageDlg from "./dlg/blood-message-dlg";
import * as OpenDlg from './dlg/blood-open-dlg';
import * as SdcDlg from './dlg/blood-save-discard-cancel';
import * as StringDlg from './dlg/blood-string-dlg';

/// hash used by the server to sanity check
export function hashFunc(input:string):number {
    let hash = 0;
    input += '; So say we all.';
    for (var i=0; i<input.length; ++i) {
        const char = input.charCodeAt(i);
        hash = ((hash<<5)-hash) + char;
        hash = hash|0;
    }
    return hash;
}

/// prompt for save if needed, then reset to new custom edition
export async function newEdition(Edition:Edition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(Edition)) {
        Edition.reset();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

/**
 * prompt for a name, then save with that name
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param Edition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function saveAs(username:string, password:string, Edition:Edition):Promise<boolean> {
    const name = await promptForName(Edition.getSaveName());
    if (!name) {
        return Promise.resolve(false);
    }
    const backupName = Edition.getSaveName();
    try {
        Edition.setSaveName(name);
        return await Spinner.show(`Saving as ${name}`, _save(username, password, Edition));
    } catch (error) {
        Edition.setSaveName(backupName);
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
    }
    return Promise.resolve(false);
}

/**
 *  show loading dialog while saving
 * @param username login credentials
 * @param password login credentials
 * @param Edition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function save(username:string, password:string, Edition:Edition):Promise<boolean> {
    const saveName = Edition.getSaveName();
    switch (saveName) {
        case '':
            return await saveAs(username, password, Edition);
        default:
            return await Spinner.show(`Saving as ${saveName}`, _save(username, password, Edition));
    }
}

/**
 * Save the file under the name saved in it
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param Edition file to save
 * @returns promise resolving to whether the save was successful
 */
async function _save(username:string, password:string, Edition:Edition):Promise<boolean> {
    type SaveData = {
        saveName:string,
        check:number,
        Edition:EditionSaveData
    };
    
    const saveName = Edition.getSaveName();
    const saveData:SaveData = {
        saveName: saveName,
        check: hashFunc(saveName),
        Edition: Edition.getSaveData()
    };
    const payload = JSON.stringify(saveData);
    const {error} = await cmd(username, password, 'save', `Saving as ${saveName}`, payload);
    if (error) {
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
        return false;
    }
    Edition.setDirty(false);
    return true;
}

/**
 * Open a file
 * @param username login credentials
 * @param password login credentials
 * @param Edition Edition instance with which to open a file
 * @returns whether a file was successfully opened
 */
export async function open(username:string, password:string, Edition:Edition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(Edition)) {
        return await openNoSavePrompt(username, password, Edition);
    }
    return Promise.resolve(false);
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param username login credentials
 * @param password login credentials
 * @param Edition Edition instance with which to open a file
 * @returns whether a file was successfully opened
 */
async function openNoSavePrompt(username:string, password:string, Edition:Edition):Promise<boolean> {
    const name = await OpenDlg.show(username, password);
    if (name) {
        return await openNoPrompts(username, password, Edition, name);
    }
    return Promise.resolve(false);
}

/**
 * Open a file by name (no save prompts!)
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param Edition Edition instance with which to open a file
 * @param name name of the file to open
 * @returns promise that resolves to whether a file was successfully opened
 */
async function openNoPrompts(username:string, password:string, Edition:Edition, name:string):Promise<boolean> {
    const openData = {
        saveName: name,
        check: hashFunc(name)
    };
    const payload = JSON.stringify(openData);
    const cmdResult = await cmd(username, password, 'open', `Opening ${name}`, payload);
    const {error,data} = cmdResult;
    if (error) {
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
        return false;
    }
    const result = Edition.open(name, data as EditionSaveData);
    return Promise.resolve(result);
}

/**
 * prompt the user to enter a name to save as
 */
async function promptForName(defaultName:string):Promise<string|null> {
    return await StringDlg.show(
        'Enter name to save as. (lowercase with no spaces or special characters)',
        defaultName,
        {
            pattern:'[-a-z0-9.]{1,25}',
            hint: 'lowercase with no spaces or special characters',
            sanitizeFn: sanitizeSaveName
        });
}

/**
 * sanitize a save name
 */
function sanitizeSaveName(original:string):string {
    const re = /^[-a-z0-9.]{1,25}$/;
    if (re.test(original)) {
        return original;
    }
    let corrected = '';
    for (const char of original) {
        if (re.test(char) && corrected.length < 25) {
            corrected += char;
        }
    }
    return corrected;
}

/**
 * send a command to the server, await response
 * Brings up the loading spinner during the operation
 */
async function cmd(username:string, password:string, cmdName:string, spinnerMessage:string, body?:BodyInit|null|undefined):Promise<any> {
    return await Spinner.show(spinnerMessage, _cmd(username, password, cmdName, body));
}

/** send a command to the server, await response */
async function _cmd(username:string, password:string, cmdName:string, body?:BodyInit|null):Promise<any> {
    let response:Response;
    const base64 = btoa(`${username}:${password}`);
    response = await fetch(`https://www.bloodstar.xyz/cmd/${cmdName}.php`, {
            method: 'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json',
                'Authorization': `Basic ${base64}`
            },
            mode: 'cors',
            credentials: 'include',
            body
        });

    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    return responseJson;
}

/**
 * attempt to log in
 * Brings up the loading spinner during the operation
 */
export async function login(username:string, password:string):Promise<boolean> {
    try {
        const {success} = await cmd(username, password, 'login', `Logging in as ${username}`);
        return success;
    } catch (error) {
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
        return false;
    }
}

/**
 * Get a list of openable files
 * @param username username
 * @param password password
 */
async function _listFiles(username:string, password:string):Promise<string[]> {
    const {error,files} = await cmd(username, password, 'list', 'Retrieving file list');
    if (error) {
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
    }
    return files || [];
}

/**
 * Get a list of openable files
 * Brings up the loading spinner during the operation
 * @param username username
 * @param password password
 */
export async function listFiles(username:string, password:string):Promise<string[]> {
    return await Spinner.show('Retrieving file list', _listFiles(username, password));
}
