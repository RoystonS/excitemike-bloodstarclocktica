/**
 * Dialogs for opening a file
 * @module OpenFlow
 */
import {Edition} from '../model/edition';
import * as SdcDlg from '../dlg/blood-save-discard-cancel';
import { spinner } from './spinner-dlg';
import cmd from '../commands/cmd';
import { showError } from './blood-message-dlg';
import { createElement, CreateElementsOptions } from '../util';
import { AriaDialog } from './aria-dlg';
import { setRecentFile } from '../recent-file';

type ListFilesReturn = {error?:string,files:string[]};
type OpenReturn = {error?:string,data:{[key:string]:unknown}};

/** dialog for choosing a file */
class ChooseFileDlg extends AriaDialog<string> {
    /** returns name of chosen file, or empty string */
    async open():Promise<string> {
        const fileListDiv = createElement({t:'div',css:['openDlgList']});
        const body:CreateElementsOptions = [
            {t:'p',txt:'Choose an existing file to open:'},
            fileListDiv
        ];

        const files = await listFiles();
        if (!files) {return '';}
        if (files.length) {
            for (const name of files) {
                const button = createElement({t:'button',txt:name,events:{click:()=>this.close(name)}});
                fileListDiv.appendChild(button);
            }
        } else {
            fileListDiv.appendChild(createElement({t:'p',txt:'No files found.',a:{role:'alert'}}));
        }
        
        return await this.baseOpen(
            document.activeElement,
            'open',
            body,
            [{label:'Cancel'}]
        )||'';
    }
}

/** share file chooser with the delete command */
export async function chooseFile():Promise<string> {
    return await new ChooseFileDlg().open();
}

/**
 * Get a list of openable files
 * Brings up the loading spinner during the operation
 */
async function listFiles():Promise<string[]> {
    try {
        const {error,files} = await cmd('list', 'Retrieving file list') as ListFilesReturn;
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

/**
 * Open a file by name (no save prompts!)
 * Brings up the loading spinner during the operation
 * @param edition Edition instance with which to open a file
 * @param name name of the file to open
 * @param suppressErrorMessage if true, no error message appears when soemthing goes wrong
 * @returns promise that resolves to whether a file was successfully opened
 */
 async function openNoPrompts(edition:Edition, name:string, suppressErrorMessage=false):Promise<boolean> {
    const openData = {
        saveName: name
    };
    const payload = JSON.stringify(openData);
    const {error,data} = await cmd('open', `Retrieving ${name}`, payload) as OpenReturn;
    if (error) {
        if (!suppressErrorMessage) {
            await showError('Error', `Error encountered while trying to open file ${name}`, error);
        }
        return false;
    }
    const success = await spinner('open', `Opening edition file "${name}"`, edition.open(name, data));
    if (success) {
        setRecentFile(edition.saveName.get());
    }
    return success;
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param edition Edition instance with which to open a file
 * @param name Optional already-chosen file
 * @param suppressErrorMessage if true, no error message appears when soemthing goes wrong
 * @returns whether a file was successfully opened
 */
async function openNoSavePrompt(edition:Edition, name='', suppressErrorMessage=false):Promise<boolean> {
    const finalName = name || await new ChooseFileDlg().open();
    if (finalName) {
        return await spinner('open', `Opening edition file "${finalName}"`, openNoPrompts(edition, finalName, suppressErrorMessage));
    }
    return false;
}

/**
 * Open a file
 * @param edition Edition instance with which to open a file
 * @param name Optional already-chosen file
 * @param suppressErrorMessage if true, no error message appears when soemthing goes wrong
 * @returns whether a file was successfully opened
 */
 export async function show(edition:Edition, name='', suppressErrorMessage=false):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        return await openNoSavePrompt(edition, name, suppressErrorMessage);
    }
    return false;
}
