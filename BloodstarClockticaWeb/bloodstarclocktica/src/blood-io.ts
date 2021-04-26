import * as BloodDocument from './blood-document';
import * as LoadDlg from './dlg/blood-loading-dlg';
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

/// prompt for save if needed, then reset to new document
export async function newDocument(bloodDocument:BloodDocument.BloodDocument):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(bloodDocument)) {
      bloodDocument.reset('New Edition');
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

/// prompt for a name, then save with that name
export async function saveAs(bloodDocument:BloodDocument.BloodDocument):Promise<boolean> {
    const name = await promptForName(bloodDocument.getSaveName());
    if (!name) {
        return Promise.resolve(false);
    }
    const backupName = bloodDocument.getSaveName();
    try {
        bloodDocument.setSaveName(name);
        return await LoadDlg.show(_save(bloodDocument));
    } catch (e) {
        console.error(e);
        bloodDocument.setSaveName(backupName);
    }
    return Promise.resolve(false);
}

/// show loading dialog while saving
export async function save(bloodDocument:BloodDocument.BloodDocument):Promise<boolean> {
    switch (bloodDocument.getSaveName()) {
        case '':
            return await saveAs(bloodDocument);
        default:
            return await LoadDlg.show(_save(bloodDocument));
    }
}

/**
 * Save the file under the name saved in it
 * @param bloodDocument file to save
 * @returns promise resolving to whether the save was successful
 */
async function _save(bloodDocument:BloodDocument.BloodDocument):Promise<boolean> {
    const saveData:BloodDocument.SaveData = bloodDocument.getSaveData();
    // TODO: use cmd
    const response = await fetch('https://www.meyermike.com/bloodstar/save.php', {
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(saveData)
        });
    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    const {error} = responseJson;
    if (error) {
        throw new Error(error);
    }
    bloodDocument.setDirty(false);
    return true;
}

/**
 * Open a file
 * @param bloodDocument BloodDocument instance with which to open a file
 * @returns whether a file was successfully opened
 */
export async function open(bloodDocument:BloodDocument.BloodDocument, username:string, password:string):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(bloodDocument)) {
        return await openNoSavePrompt(bloodDocument, username, password);
    }
    return Promise.resolve(false);
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param bloodDocument BloodDocument instance with which to open a file
 * @returns whether a file was successfully opened
 */
async function openNoSavePrompt(bloodDocument:BloodDocument.BloodDocument, username:string, password:string):Promise<boolean> {
    const name = await OpenDlg.show(username, password);
    if (name) {
        return await openNoPrompts(bloodDocument, name);
    }
    return Promise.resolve(false);
}

/**
 * Open a file by name (no save prompts!)
 * @param bloodDocument BloodDocument instance with which to open a file
 * @param name name of the file to open
 * @returns whether a file was successfully opened
 */
async function openNoPrompts(bloodDocument:BloodDocument.BloodDocument, name:string):Promise<boolean> {
    const openData = {
        saveName: name,
        check: hashFunc(name)
    };
    // TODO: use cmd
    const response = await fetch('https://www.meyermike.com/bloodstar/open.php', {
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(openData)
        });
    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    const {error,data} = responseJson;
    if (error) {
        throw new Error(error);
    }
    const result = bloodDocument.open(data as BloodDocument.SaveData);
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

/** send a command to the server, await response */
export async function cmd(username:string, password:string, cmdName:string):Promise<any> {
    let response:Response;
    const base64 = btoa(`${username}:${password}`);
    try {
        response = await fetch(`https://www.meyermike.com/bloodstar/cmd/${cmdName}.php`, {
                method: 'POST',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json',
                    'Authorization': `Basic ${base64}`
                },
                mode: 'cors',
                credentials: 'include'
            });
    } catch (e) {
        console.error(e);
        throw e;
    }
    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    return responseJson;
}

/** attempt to log in */
export async function login(username:string, password:string):Promise<boolean> {
    try {
        const {success} = await cmd(username, password, 'login');
        return success;
    } catch (_) {
        alert('login failed');
        return false;
    }
}