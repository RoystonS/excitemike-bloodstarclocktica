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
 * @param auth base64'd `${username}:${password}`
 * @param edition Edition instance with which to open a file
 * @param name Optional already-chosen file
 * @param suppressErrorMessage if true, no error message appears when soemthing goes wrong
 * @returns whether a file was successfully opened
 */
export async function open(auth:string, edition:Edition, name='', suppressErrorMessage=false):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        return await openNoSavePrompt(auth, edition, name, suppressErrorMessage);
    }
    return false;
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param auth base64'd `${username}:${password}`
 * @param edition Edition instance with which to open a file
 * @param name Optional already-chosen file
 * @param suppressErrorMessage if true, no error message appears when soemthing goes wrong
 * @returns whether a file was successfully opened
 */
async function openNoSavePrompt(auth:string, edition:Edition, name='', suppressErrorMessage=false):Promise<boolean> {
    const finalName = name || await OpenDlg.show(auth);
    if (finalName) {
        return await spinner('open', `Opening edition file "${name}"`, openNoPrompts(auth, edition, finalName, suppressErrorMessage));
    }
    return false;
}

/**
 * Open a file by name (no save prompts!)
 * Brings up the loading spinner during the operation
 * @param auth base64'd `${username}:${password}`
 * @param edition Edition instance with which to open a file
 * @param name name of the file to open
 * @param suppressErrorMessage if true, no error message appears when soemthing goes wrong
 * @returns promise that resolves to whether a file was successfully opened
 */
async function openNoPrompts(auth:string, edition:Edition, name:string, suppressErrorMessage=false):Promise<boolean> {
    const openData = {
        saveName: name
    };
    const payload = JSON.stringify(openData);
    const {error,data} = await cmd(auth, 'open', `Retrieving ${name}`, payload) as OpenReturn;
    if (error) {
        if (!suppressErrorMessage) {
            await showError('Error', `Error encountered while trying to open file ${name}`, error);
        }
        return false;
    }
    return await spinner('open', `Opening edition file "${name}"`, edition.open(name, data));
}

/**
 * Get a list of openable files
 * Brings up the loading spinner during the operation
 * @param auth base64'd `${username}:${password}`
 */
export async function listFiles(auth:string):Promise<string[]> {
    try {
        const {error,files} = await cmd(auth, 'list', 'Retrieving file list') as ListFilesReturn;
        if (error) {
            console.error(error);
            await showError('Network Error', `Error encountered while retrieving file list`, error);
        }
        return files || [];
    } catch (error) {
        await showError('Network Error', `Error encountered while retrieving file list`, error);
    }
    return [];
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
