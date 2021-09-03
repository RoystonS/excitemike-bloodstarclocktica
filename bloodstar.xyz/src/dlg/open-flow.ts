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
import {show as getConfirmation} from "./yes-no-dlg";
import {showBlockUser} from './block-flow';

type LeaveRequest = {token:string, owner:string, saveName:string};
type LeaveResponse = {error:string}|true;
type ListRequest = {token:string, includeShared?:boolean};
type ListFilesResponse = {
    error?:string,
    files:string[],
    shared?:{[key:string]:string[]}
};
export type ListFilesReturn = {
    yours: string[],
    shared?: {[key:string]:string[]}
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
    includeShared?:boolean,

    /** whether to label it as making a copy of shared files */
    copyWarning?:boolean
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

        const fileListDiv = createElement({t:'div', css:['openDlgList']});
        const body:CreateElementsOptions = [
            {t:'h1', txt:options?.title||'Choose File'},
            {t:'p', txt:options?.message||'Choose an existing file to open:'},
            fileListDiv
        ];

        const {yours:yourFiles, shared:sharedFiles} = await listFiles(sessionInfo, options?.includeShared||false);
        const owners = (options?.includeShared && sharedFiles) ? Object.keys(sharedFiles) : [];

        // list your files (perhaps with label)
        if (owners.length) {
            fileListDiv.appendChild(createElement({t:'p', txt:'Your files:'}));
        }
        if (yourFiles.length) {
            for (const name of yourFiles) {
                const button = createElement({t:'button', txt:name, events:{click:()=>this.close(name)}});
                fileListDiv.appendChild(button);
            }
        } else {
            fileListDiv.appendChild(createElement({t:'p', txt:'No files found.', a:{role:'alert'}}));
        }

        // list shared files
        if (owners.length && sharedFiles) {
            const sharedLabel = options?.copyWarning ? 'Copy a file shared with you:' : 'Files shared with you:';
            fileListDiv.appendChild(createElement({t:'p', txt:sharedLabel}));
            const sharedList = createElement({t:'div', css:['openSharedList']});
            fileListDiv.appendChild(sharedList);
            for (const owner of owners) {
                const editions = sharedFiles[owner];
                for (const edition of editions) {
                    const label = `${owner} / ${edition}`;
                    const openButton = createElement({t:'button', txt:label, events:{click:()=>this.close([owner, edition])}});
                    const leaveButton = createElement({t:'button', txt:'Leave'});
                    const blockButton = createElement({t:'button', txt:'Block'});
                    leaveButton.addEventListener('click', async ()=>{
                        if (await showLeave(owner, edition)) {
                            // Row can be removed
                            openButton.remove();
                            leaveButton.remove();
                            blockButton.remove();
                        }
                    });
                    blockButton.addEventListener('click', async ()=>{
                        if (await showBlockUser(owner)) {
                            // Any number of rows could be wrong now. Bail on the whole popup.
                            this.close(null);
                        }
                    });
                    sharedList.appendChild(openButton);
                    sharedList.appendChild(leaveButton);
                    sharedList.appendChild(blockButton);
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
export function chooseFile(options?:ChooseFileOptions):Promise<string|[string, string]> {
    return new ChooseFileDlg().open(options);
}

/**
 * Get a list of openable files
 * Brings up the loading spinner during the operation
 */
async function listFiles(sessionInfo:SessionInfo, includeShared:boolean):Promise<ListFilesReturn> {
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
        const ret:ListFilesReturn = {
            yours: response.files || [],
        };
        if (response.shared && Object.keys(response.shared).length) {
            ret.shared = response.shared;
        }
        return ret;
    } catch (error) {
        await showError('Network Error', `Error encountered while retrieving file list`, error);
    }
    return {yours:[]};
}

/**
 * Open a file by name (no save prompts!)
 * Brings up the loading spinner during the operation
 * @param edition Edition instance with which to open a file
 * @param name name of the file to open
 * @returns promise that resolves to whether a file was successfully opened
 */
 async function openNoPrompts(edition:Edition, name:string|[string, string]):Promise<boolean> {
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
            await showError('Error', `Error encountered while trying to open file ${name}`, response.error);
            return false;
        }
        const saveName = Array.isArray(name) ? '' : name;
        const success = await spinner('open', `Opening edition file "${name}"`, edition.open(saveName, response.data));
        if (success) {
            setRecentFile(edition.saveName.get(), sessionInfo.email);
        }
        return success;
    } catch (error) {
        await showError('Error', `Error encountered while trying to open file ${name}`, error);
        return false;
    }
}

/**
 * Prompt for the file to open and open it, skipping the save prompt
 * @param edition Edition instance with which to open a file
 * @param name Optional already-chosen file
 * @param options optional ChooseFileOptions for the dialog
 * @returns whether a file was successfully opened
 */
async function openPromptNoSavePrompt(edition:Edition, options?:ChooseFileOptions):Promise<boolean> {
    const name = await new ChooseFileDlg().open(options);
    return openExistingNoSavePrompt(edition, name);
}
/**
 * Open chosen file, skipping the save prompt
 * @param edition Edition instance with which to open a file
 * @param name Optional already-chosen file
 * @param options optional ChooseFileOptions for the dialog
 * @returns whether a file was successfully opened
 */
function openExistingNoSavePrompt(edition:Edition, name:string|[string, string]):Promise<boolean> {
    if (Array.isArray(name)) {
        const label = name.join(' / ');
        return spinner('open', `Opening shared file "${label}"`, openNoPrompts(edition, name));
    } else if (name) {
        return spinner('open', `Opening edition file "${name}"`, openNoPrompts(edition, name));
    }
    return Promise.resolve(false);
}

/**
 * Open an already-chosen file
 * @param edition Edition instance with which to open a file
 * @param name savename of the file to open
 * @returns whether a file was successfully opened
 */
export async function openExisting(edition:Edition, name:string):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        return openExistingNoSavePrompt(edition, name);
    }
    return false;
}

/**
 * Open a file
 * @param edition Edition instance with which to open a file
 * @param options optional ChooseFileOptions for the dialog
 * @returns whether a file was successfully opened
 */
export async function promptAndOpen(edition:Edition, options?:ChooseFileOptions):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        return openPromptNoSavePrompt(edition, options);
    }
    return false;
}

/**
 * Confirm, then leave a file's sharelist
 * @param owner username of the file's owner
 * @param edition savename for the file
 * @returns promise that resolves to whether you left the file
 */
async function showLeave(owner:string, edition:string):Promise<boolean> {
    const sessionInfo = await signIn({
        title:'Sign In to Leave',
        message:'You must first sign in to leave the file\'s sharelist.'
    });
    if (!sessionInfo) {return false;}
    if (!await getConfirmation(
        `Leave "${owner} / ${edition}"`,
        `Are you sure you'd like to leave "${owner} / ${edition}"? You will no longer be able to import from this file.`,
        ))
    { return false; }
    
    const request:LeaveRequest = {
        token:sessionInfo.token,
        owner,
        saveName:edition
    };

    try {
        const response = await signedInCmd<LeaveResponse>('leave', 'Leaving share list', request);
        if (response===true) {
            return true;
        }
        const {error} = response;
        console.error(error);
        await showError('Network Error', `Error encountered while retrieving share list`, error);
        return false;
    } catch (error) {
        await showError('Network Error', `Error encountered while retrieving share list`, error);
        return false;
    }
}
