import cmd from './commands/cmd';
import {Edition} from './model/edition';
import {spinner} from './dlg/spinner-dlg';
import {showError} from "./dlg/blood-message-dlg";
import * as OpenDlg from './dlg/blood-open-dlg';
import * as SdcDlg from './dlg/blood-save-discard-cancel';
import * as StringDlg from './dlg/blood-string-dlg';
import {importJson, ScriptEntry} from './import/json';
import { fetchJson } from './util';
import { AriaDialog } from './dlg/aria-dlg';
import { importBloodFile } from './import/blood-file';

type ListFilesReturn = {error?:string,files:string[]};
type LoginReturn = {success:boolean};
type OpenReturn = {error?:string,data:{[key:string]:unknown}};

/// prompt for save if needed, then reset to new custom edition
export async function newEdition(edition:Edition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        await edition.reset();
        return true;
    }
    return false;
}

/**
 * Open a file
 * @param username login credentials
 * @param password login credentials
 * @param edition Edition instance with which to open a file
 * @returns whether a file was successfully opened
 */
export async function open(username:string, password:string, edition:Edition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        return await openNoSavePrompt(username, password, edition);
    }
    return Promise.resolve(false);
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param username login credentials
 * @param password login credentials
 * @param edition Edition instance with which to open a file
 * @returns whether a file was successfully opened
 */
async function openNoSavePrompt(username:string, password:string, edition:Edition):Promise<boolean> {
    const name = await OpenDlg.show(username, password);
    if (name) {
        return await spinner('open', `Opening edition file "${name}"`, openNoPrompts(username, password, edition, name));
    }
    return Promise.resolve(false);
}

/**
 * Open a file by name (no save prompts!)
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param edition Edition instance with which to open a file
 * @param name name of the file to open
 * @returns promise that resolves to whether a file was successfully opened
 */
async function openNoPrompts(username:string, password:string, edition:Edition, name:string):Promise<boolean> {
    const openData = {
        saveName: name
    };
    const payload = JSON.stringify(openData);
    const {error,data} = await cmd(username, password, 'open', `Retrieving ${name}`, payload) as OpenReturn;
    if (error) {
        showError('Error', `Error encountered while trying to open file ${name}`, error);
        return false;
    }
    return await spinner('open', `Opening edition file "${name}"`, edition.open(name, data));
}

/**
 * attempt to log in
 * Brings up the loading spinner during the operation
 */
export async function login(username:string, password:string):Promise<boolean> {
    try {
        const {success} = await cmd(username, password, 'login', `Logging in as ${username}`) as LoginReturn;
        return success;
    } catch (error) {
        showError('Network Error', `Error encountered during login`, error);
        console.error(error);
        return false;
    }
}

/**
 * Get a list of openable files, bringing up a spinner during the operation
 * @param username username
 * @param password password
 */
async function _listFiles(username:string, password:string):Promise<string[]> {
    const {error,files} = await cmd(username, password, 'list', 'Retrieving file list') as ListFilesReturn;
    if (error) {
        showError('Network Error', `Error encountered while retrieving file list`, error);
        console.error(error);
    }
    return files || [];
}

/**
 * Get a list of openable files
 * Brings up the loading spinner during the operation
 * @param username username
 * @param password password
 */
export async function listFiles(username:string, password:string):Promise<string[]|null> {
    return await _listFiles(username, password);
}

/** user chose to import character(s) from a json file */
export async function importJsonFromUrl(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    const url = await StringDlg.show('Enter URL to a custom-script.json file.');
    if (!url){return false;}
    const json = await fetchJson<ScriptEntry[]>(url);
    if (!json) {return false;}
    return await spinner('importJsonFromUrl', 'Importing json', importJson(json, edition)) || false;
}

/** promise for choosing a JSON file */
async function chooseJsonFile():Promise<File|null> {
    const fileInput = document.getElementById('jsonFileInput');
    if (!(fileInput instanceof HTMLInputElement)) {return null;}
    fileInput.value = '';
    const dlg = new AriaDialog<File|null>();

    function chooseFile():void {
        if (fileInput instanceof HTMLInputElement) {
            fileInput.onchange=()=>{
                dlg.close(fileInput.files && fileInput.files[0]);
            };
            fileInput.click();
        } else {
            dlg.close(null)
        }
    }
    
    return await dlg.baseOpen(
        document.activeElement,
        'chooseJsonFile',
        [{
            t:'button',
            txt:'Choose File',
            events:{click:()=>chooseFile()}
        }],
        [
            {label:'Cancel'}
        ]
    );
}

/** user chose to import character(s) from a json file */
export async function importJsonFromFile(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    const file = await chooseJsonFile();
    if (!file){return false;}
    return await importJson(file, edition);
}

/** user chose to import a project form the windows version of Bloodstar Clocktica */
export async function importBlood(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    return await importBloodFile(edition);
}
