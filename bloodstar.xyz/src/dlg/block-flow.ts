/**
* Manage Blocked Users dialog
* @module ManageBlockedDlg
*/
import signIn, { signedInCmd } from '../sign-in';
import { createElement, CreateElementsOptions } from '../util';
import { updateUsernameWarnings, validateUsername } from '../validate';
import {AriaDialog, showDialog} from './aria-dlg'
import {show as showMessage, showError} from './blood-message-dlg';
import {show as getConfirmation} from "./yes-no-dlg";

type BlockRequest = {token:string, username:string};
type BlockResponse = {error:string}|true;

type GetBlockedRequest = {token:string};
type GetBlockedResponse = {error:string}|{users:string[]};

type UnblockRequest = {token:string, username:string};
type UnblockResponse = {error:string}|true;

class ManageBlockedDlg extends AriaDialog<void> {
    blockList:string[]|null = null;
    listDiv:HTMLDivElement|null = null;
    addButton:HTMLButtonElement|null = null;

    /** create the dialog */
    async open():Promise<void> {
        this.blockList = await getBlockList();
        if (!this.blockList){return;}
        this.listDiv = createElement({t:'div', css:['shareDlgList']});
        this.addButton = createElement({t:'button', txt:'Block a User'});
        this.addButton.addEventListener('click', async ()=>{
            const username = await showBlockPrompt();
            if (username && await doBlockUser(username)) {
                this.blockList?.push(username);
                this.update();
            }
        });
    
        const body:CreateElementsOptions = [
            {t:'h1', txt:'Manage Blocked Users'},
            {t:'p', txt:'Currently blocked users:'},
            this.listDiv,
            {t:'div', css:['column'], children:[this.addButton]}
        ];
    
        this.update();
        
        await this.baseOpen(
            document.activeElement,
            'manage-blocked-dlg',
            body,
            [{label:"Done"}]
        );
    }

    /** add a row to the list */
    addRow(name:string):void {
        if (!this.listDiv) {return;}
        this.listDiv.appendChild(createElement({t:'span', txt:name}));
        this.listDiv.appendChild(createElement({t:'button', txt:'Unblock', events:{click:async ()=>{
            if (this.blockList && await showUnblockUser(name)) {
                const i = this.blockList.indexOf(name);
                if (i !== -1) {
                    this.blockList.splice(i, 1);
                    this.update();
                }
            }
        }}}));
    }

    /** update dialog after changes */
    update():void {
        if (!this.listDiv) {return;}
        if (!this.blockList) {return;}
        if (this.blockList.length === 0) {
            this.listDiv.innerText = 'No one';
        } else {
            this.listDiv.innerText = '';
            for (const name of this.blockList) {
                this.addRow(name);
            }
        }
    }
}

/**
 * do the actual command to block a user
 * 
 */
async function doBlockUser(username:string):Promise<boolean> {
    const sessionInfo = await signIn({
        title:'Sign In',
        message:'You must sign in to manage your block list.'
    });
    if (!sessionInfo){return false;}
    const request:BlockRequest = {
        token:sessionInfo.token,
        username,
    };
    try {
        const response = await signedInCmd<BlockResponse>('block', 'Blocking user', request);
        if (response===true) {
            return true;
        }
        const {error} = response;
        throw error;
    } catch (error) {
        await showError('Network Error', `Error encountered while blocking`, error);
        return false;
    }
}


/**
 * Get a list of users you have blocked
 * Brings up the loading spinner during the operation
 */
export async function getBlockList():Promise<string[]|null> {
    const sessionInfo = await signIn({
        title:'Sign In',
        message:'You must sign in to manage your block list.'
    });
    if (!sessionInfo){return null;}
    const request:GetBlockedRequest={token:sessionInfo.token};
    try {
        const response = await signedInCmd<GetBlockedResponse>('get-blocked', 'Retrieving block list', request);
        if ('error' in response) {
            throw response.error;
        }
        return response.users;
    } catch (error) {
        await showError('Network Error', `Error encountered while retrieving block list`, error);
    }
    return [];
}

/**
 * Prompt for a name of a user to block
 * @returns Promise that resolves to the name to blockor the empty string if cancelled
 */
async function showBlockPrompt():Promise<string> {
    const usernameField = createElement({t:'input', a:{type:'text', required:'true', placeholder:'Username', autocomplete:'username'}, id:'blockPromptUsername'});
    const usernameWarnings = createElement({t:'div', css:['column'], a:{style:'color:red'}});
    const syncToButton = ()=>{
        const buttonElem = document.getElementById('blockUserButton');
        if (!(buttonElem instanceof HTMLButtonElement)) {return;}
        buttonElem.disabled = !usernameField.value;
    };
    const usernameWarn = ()=>{
        updateUsernameWarnings(usernameField.value, usernameWarnings, 'Username');
        syncToButton();
    };
    usernameField.addEventListener('change', usernameWarn);
    usernameField.addEventListener('input', usernameWarn);
    const blockUser = async ():Promise<string>=>{
        if (!validateUsername(usernameField.value)) {
            await showMessage('Block Error', 'Username not valid.');
            return '';
        }
        return usernameField.value;
    };
    const buttons = [
        {label:'Block', id:'blockUserButton', callback:blockUser, disabled:true},
        {label:'Cancel'}
    ];

    return await showDialog<string>(
        document.activeElement,
        'block-prompt',
        [
            {t:'h1', txt:'Block User'},
            {t:'div', css:['twoColumnGrid'], children:[
                {t:'label', a:{'for':'blockPromptUsername'}, txt:'Username'},
                usernameField,
            ]},
            usernameWarnings
        ],
        buttons
    ) || '';
}

/**
 * Confirm, then block a user
 * @param username username of who to block
 * @returns promise that resolves to whether the user was blocked
 */
export async function showBlockUser(username:string):Promise<boolean> {
    const sessionInfo = await signIn({
        title:'Sign In to Block',
        message:'You must first sign in before blocking a user.'
    });
    if (!sessionInfo) {return false;}
    if (!await getConfirmation(
        `Block ${username}`,
        `Are you sure you'd like to block ${username}? You will no longer be able to import files they share.`,
    ))
    { return false; }

    return doBlockUser(username);
}

/** show dialog for managing block list */
export async function showManageBlocked():Promise<void>{
    await new ManageBlockedDlg().open();
}

/**
 * Confirm, then unblock a user
 * @param username username of who to unblock
 * @returns promise that resolves to whether the user was unblocked
 */
export async function showUnblockUser(username:string):Promise<boolean> {
    // TODO: DRY: signin, then confirmation, then signedInCmd, is a common pattern. make a single function for it somewhere?
    const sessionInfo = await signIn({
        title:'Sign In to Unblock',
        message:'You must first sign in before unblocking a user.'
    });
    if (!sessionInfo) {return false;}
    if (!await getConfirmation(
        `Unblock ${username}`,
        `Are you sure you'd like to unblock ${username}?`,
    ))
    { return false; }
    
    const request:UnblockRequest = {
        token:sessionInfo.token,
        username,
    };

    try {
        const response = await signedInCmd<UnblockResponse>('unblock', 'Unblocking user', request);
        if (response===true) {
            return true;
        }
        const {error} = response;
        throw error;
    } catch (error) {
        await showError('Network Error', `Error encountered while unblocking`, error);
        return false;
    }
}