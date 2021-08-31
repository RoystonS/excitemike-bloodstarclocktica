/**
 * Dialogs for opening a file
 * @module OpenFlow
 */
import {Edition} from '../model/edition';
import * as SdcDlg from '../dlg/blood-save-discard-cancel';
import { spinner } from './spinner-dlg';
import { showError } from './blood-message-dlg';
import { createElement, CreateElementsOptions } from '../util';
import { AriaDialog } from './aria-dlg';
import { setRecentFile } from '../recent-file';
import signIn, { signedInCmd } from '../sign-in';
import { SessionInfo } from '../iam';

type ListRequest = {token:string,includeShared?:boolean};
type ListFilesResponse = {
    error?:string,
    files:string[],
    shared?:{[key:string]:string[]}
};
export type OpenRequest = {
    saveName: string|[string, string],
    token: string,
    username: string
};
export type OpenResponse = {error:string}|{data:{[key:string]:unknown}};

type ChooseFileOptions = {
    /** customize prompt title */
    title?:string,

    /** customize prompt message */
    message?:string,

    /** list shared files? */
    includeShared?:boolean
};

/** dialog for choosing a file */
class ChooseFileDlg extends AriaDialog<string|[string, string]> {
    /** returns name of chosen file, or empty string */
    async open(options?:ChooseFileOptions):Promise<string|[string, string]> {
        const sessionInfo = await signIn({
            title:'Sign In to Choose File',
            message:'You must first sign in to choose a file.'
        });
        if (!sessionInfo) {return '';}

        const fileListDiv = createElement({t:'div',css:['openDlgList']});
        const body:CreateElementsOptions = [
            {t:'h1',txt:options?.title||'Choose File'},
            {t:'p',txt:options?.message||'Choose an existing file to open:'},
            fileListDiv
        ];

        const files = await listFiles(sessionInfo, options?.includeShared||false);
        if (!files) {return '';}
        const yourFiles = Array.isArray(files) ? files : files.files;
        const owners = (options?.includeShared && !Array.isArray(files) && files.shared) ? Object.keys(files.shared) : [];
        const sharedFiles = (owners.length > 0 && !Array.isArray(files) && files.shared) ? files.shared : {};

        // list your files (perhaps with label)
        if (owners.length) {
            fileListDiv.appendChild(createElement({t:'p',txt:'Your files:'}));
        }
        if (yourFiles.length) {
            for (const name of yourFiles) {
                const button = createElement({t:'button',txt:name,events:{click:()=>this.close(name)}});
                fileListDiv.appendChild(button);
            }
        } else {
            fileListDiv.appendChild(createElement({t:'p',txt:'No files found.',a:{role:'alert'}}));
        }

        // list shared files
        if (owners.length) {
            fileListDiv.appendChild(createElement({t:'p',txt:'Files shared with you:'}));
            for (const owner of owners) {
                const editions = sharedFiles[owner];
                for (const edition of editions) {
                    const label = `${owner} / ${edition}`;
                    const button = createElement({t:'button',txt:label,events:{click:()=>this.close([owner,edition])}});
                    fileListDiv.appendChild(button);
                }
            }
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
// TODO: simplify return type
export async function chooseFile(options?:ChooseFileOptions):Promise<string|[string, string]> {
    return await new ChooseFileDlg().open(options);
}

/**
 * Get a list of openable files
 * Brings up the loading spinner during the operation
 */
// TODO: simplify return type
async function listFiles(sessionInfo:SessionInfo, includeShared:boolean):Promise<string[]|ListFilesResponse> {
    const request:ListRequest={
        token:sessionInfo.token,
        includeShared
    };
    try {
        const response = await signedInCmd<ListFilesResponse>('list', 'Retrieving file list', request);
        if ('error' in response) {
            console.error(response.error);
            await showError('Network Error', `Error encountered while retrieving file list`, response.error);
        }
        // TODO: can we remove this special case without breaking anybody?
        if (!('shared' in response)) {
            return response.files || [];
        } else {
            return response;
        }
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
    try {
        const sessionInfo = await signIn({
            title:'Sign In to Open',
            message:'You must first sign in to open a file.'
        });
        if (!sessionInfo){return false;}
        const openData:OpenRequest = {
            saveName: name,
            token: sessionInfo.token,
            username: sessionInfo.username
        };
        const response = await signedInCmd<OpenResponse>('open', `Retrieving ${name}`, openData);
        if ('error' in response) {
            if (!suppressErrorMessage) {
                await showError('Error', `Error encountered while trying to open file ${name}`, response.error);
            }
            return false;
        }
        const success = await spinner('open', `Opening edition file "${name}"`, edition.open(name, response.data));
        if (success) {
            setRecentFile(edition.saveName.get(), sessionInfo.email);
        }
        return success;
    } catch (error) {
        if (!suppressErrorMessage) {
            await showError('Error', `Error encountered while trying to open file ${name}`, error);
        }
        return false;
    }
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
    // TODO: this is where we'd change it to allow opening other folks' editions
    if (!Array.isArray(finalName) && finalName) {
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
