import {CustomEdition, CustomEditionSaveData} from './custom-edition';
import * as LoadDlg from './dlg/blood-loading-dlg';
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
export async function newCustomEdition(customEdition:CustomEdition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(customEdition)) {
        customEdition.reset();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

/**
 * prompt for a name, then save with that name
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param customEdition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function saveAs(username:string, password:string, customEdition:CustomEdition):Promise<boolean> {
    const name = await promptForName(customEdition.getSaveName());
    if (!name) {
        return Promise.resolve(false);
    }
    const backupName = customEdition.getSaveName();
    try {
        customEdition.setSaveName(name);
        return await LoadDlg.show(_save(username, password, customEdition));
    } catch (error) {
        customEdition.setSaveName(backupName);
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
    }
    return Promise.resolve(false);
}

/**
 *  show loading dialog while saving
 * @param username login credentials
 * @param password login credentials
 * @param customEdition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function save(username:string, password:string, customEdition:CustomEdition):Promise<boolean> {
    switch (customEdition.getSaveName()) {
        case '':
            return await saveAs(username, password, customEdition);
        default:
            return await LoadDlg.show(_save(username, password, customEdition));
    }
}

/**
 * Save the file under the name saved in it
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param customEdition file to save
 * @returns promise resolving to whether the save was successful
 */
async function _save(username:string, password:string, customEdition:CustomEdition):Promise<boolean> {
    type SaveData = {
        saveName:string,
        check:number,
        customEdition:CustomEditionSaveData
    };
    
    const saveName = customEdition.getSaveName();
    const saveData:SaveData = {
        saveName: saveName,
        check: hashFunc(saveName),
        customEdition: customEdition.getSaveData()
    };
    const payload = JSON.stringify(saveData);
    const {error} = await cmd(username, password, 'save', payload);
    if (error) {
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
        return false;
    }
    customEdition.setDirty(false);
    return true;
}

/**
 * Open a file
 * @param username login credentials
 * @param password login credentials
 * @param customEdition CustomEdition instance with which to open a file
 * @returns whether a file was successfully opened
 */
export async function open(username:string, password:string, customEdition:CustomEdition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(customEdition)) {
        return await openNoSavePrompt(username, password, customEdition);
    }
    return Promise.resolve(false);
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param username login credentials
 * @param password login credentials
 * @param customEdition CustomEdition instance with which to open a file
 * @returns whether a file was successfully opened
 */
async function openNoSavePrompt(username:string, password:string, customEdition:CustomEdition):Promise<boolean> {
    const name = await OpenDlg.show(username, password);
    if (name) {
        return await openNoPrompts(username, password, customEdition, name);
    }
    return Promise.resolve(false);
}

/**
 * Open a file by name (no save prompts!)
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param customEdition CustomEdition instance with which to open a file
 * @param name name of the file to open
 * @returns promise that resolves to whether a file was successfully opened
 */
async function openNoPrompts(username:string, password:string, customEdition:CustomEdition, name:string):Promise<boolean> {
    const openData = {
        saveName: name,
        check: hashFunc(name)
    };
    const payload = JSON.stringify(openData);
    const cmdResult = await cmd(username, password, 'open', payload);
    const {error,data} = cmdResult;
    if (error) {
        // TODO: Handle the error more gracefully. Explain to the user what went wrong.
        MessageDlg.showError(error);
        return false;
    }
    const result = customEdition.open(name, data as CustomEditionSaveData);
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
export async function cmd(username:string, password:string, cmdName:string, body?:BodyInit|null|undefined):Promise<any> {
    return await LoadDlg.show(_cmd(username, password, cmdName, body));
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
        const {success} = await cmd(username, password, 'login');
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
    const {error,files} = await cmd(username, password, 'list');
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
    return await LoadDlg.show(_listFiles(username, password));
}
