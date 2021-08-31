/**
* Sharing dialog
* @module SharingDlg
*/
import signIn, { signedInCmd } from '../sign-in';
import { createElement, CreateElementsOptions } from '../util';
import { updateUsernameWarnings, validateUsername } from '../validate';
import {AriaDialog, showDialog} from './aria-dlg'
import {show as showMessage, showError} from './blood-message-dlg';
import {show as getConfirmation} from "./yes-no-dlg";

type ShareList = 'all'|string[];

type GetSharedRequest = {token:string,saveName:string};
type GetSharedResponse = {error?:string,users:ShareList};

type ShareRequest = GetSharedRequest & {user:string};
type ShareResponse = {error:string}|true;

type ShareAllRequest = GetSharedRequest & {all:true};
type ShareAllResponse = {error:string}|true;

type UnshareRequest = GetSharedRequest & {user:string};
type UnshareResponse = {error:string}|true;

type UnshareAllRequest = GetSharedRequest & {all:true};
type UnshareAllResponse = {error:string}|true;

class SharingDlg extends AriaDialog<void> {
    shareList:ShareList|null = null;
    editionName:string|null = null;
    listDiv:HTMLDivElement|null = null;
    allButton:HTMLButtonElement|null = null;
    addUserButton:HTMLButtonElement|null = null;
    removeAllButton:HTMLButtonElement|null = null;

    /** create the dialog */
    async open(editionName:string):Promise<void> {
        this.editionName = editionName;
        if (!this.editionName) {return;}
        this.shareList = await this.getShareList();
        if (!this.shareList){return;}
        this.listDiv = createElement({t:'div',css:['shareDlgList']});
        this.allButton = createElement({t:'button',txt:'Share with Everyone'});
        this.addUserButton = createElement({t:'button',txt:'Add User'});
        this.removeAllButton = createElement({t:'button',txt:'Remove All'});
        this.allButton.addEventListener('click', async ()=>await this.shareWithAll());
        this.addUserButton.addEventListener('click', async ()=>await this.showShareWithUser());
        this.removeAllButton.addEventListener('click', async ()=>await this.removeAll());
    
        const body:CreateElementsOptions = [
            {t:'h1',txt:'Sharing settings'},
            {t:'p',txt:'Currently sharing with:'},
            this.listDiv,
            {t:'div',css:['column'],children:[
                this.addUserButton,
                this.allButton,
                this.removeAllButton
            ]}
        ];
    
        this.updateSharingDlg();
        
        await this.baseOpen(
            document.activeElement,
            'sharing-dlg',
            body,
            [{label:"Done"}]
        );
    }

    /**
     * Get a list of users with whom you are sharing
     * Brings up the loading spinner during the operation
     */
    async getShareList():Promise<ShareList|null> {
        const sessionInfo = await signIn({
            title:'Sign In',
            message:'You must sign in to change sharing settings.'
        });
        if (!sessionInfo){return this.shareList;}
        if (!this.editionName){return this.shareList;}
        const request:GetSharedRequest={
            token:sessionInfo.token,
            saveName:this.editionName
        };
        try {
            const {error,users} = await signedInCmd<GetSharedResponse>('get-shared', 'Retrieving share list', request);
            if (error) {
                console.error(error);
                await showError('Network Error', `Error encountered while retrieving share list`, error);
                return null;
            }
            return users || [];
        } catch (error) {
            await showError('Network Error', `Error encountered while retrieving share list`, error);
            return null;
        }
        return [];
    }

    /** don't share with anyone */
    async removeAll():Promise<void> {
        if (!await getConfirmation(
            'Unshare all?', 
            `Are you sure you'd like to stop sharing with anyone?`,
            ))
        { return; }

        const sessionInfo = await signIn({
            title:'Sign In',
            message:'You must sign in to change sharing settings.'
        });
        if (!sessionInfo) {return;}
        if (!this.editionName) {return;}
        const request:UnshareAllRequest={
            token:sessionInfo.token,
            saveName:this.editionName,
            all:true
        };
        try {
            const response = await signedInCmd<UnshareAllResponse>('unshare', 'Unsharing', request);
            if (true !== response){
                await showError('Network Error', `Error encountered while unsharing`, response.error);
                console.error(response.error);
                return;
            }
        } catch (error) {
            await showError('Network Error', `Error encountered while unsharing`, error);
            return;
        }

        this.shareList = [];
        this.updateSharingDlg();
    }

    /** remove a user */
    async removeUser(user:string):Promise<void> {
        if (!await getConfirmation(
            'Unshare with user?', 
            `Are you sure you'd like to stop sharing with user "${user}"?`,
            ))
        { return; }

        const sessionInfo = await signIn({
            title:'Sign In',
            message:'You must sign in to change sharing settings.'
        });
        if (!sessionInfo) {return;}
        if (!this.editionName) {return;}
        const request:UnshareRequest={
            token:sessionInfo.token,
            saveName:this.editionName,
            user
        };
        try {
            const response = await signedInCmd<UnshareResponse>('unshare', 'Unsharing', request);
            if (true !== response){
                await showError('Network Error', `Error encountered while unsharing`, response.error);
                console.error(response.error);
                return;
            }
        } catch (error) {
            await showError('Network Error', `Error encountered while unsharing`, error);
            return;
        }

        if (Array.isArray(this.shareList)) {
            const i = this.shareList.indexOf(user);
            if (i !== -1) {
                this.shareList.splice(i, 1);
            }
            this.updateSharingDlg();
        }
    }

    /** share this edition with everyone */
    async shareWithAll():Promise<void> {
        if (!await getConfirmation(
            'Share with all users?', 
            `Are you sure you'd like to share with all users?`,
            ))
        { return; }

        const sessionInfo = await signIn({
            title:'Sign In',
            message:'You must sign in to change sharing settings.'
        });
        if (!sessionInfo) {return;}
        if (!this.editionName) {return;}
        const request:ShareAllRequest={
            token:sessionInfo.token,
            saveName:this.editionName,
            all:true
        };
        try {
            const response = await signedInCmd<ShareAllResponse>('share', 'Sharing', request);
            if (true !== response) {
                await showError('Network Error', `Error encountered while sharing`, response.error);
                console.error(response.error);
                return;
            }
        } catch (error) {
            await showError('Network Error', `Error encountered while sharing`, error);
            return;
        }

        this.shareList = 'all';
        this.updateSharingDlg();
    }

    /** do the command to share with the specified user */
    async shareWithUser(user:string):Promise<void> {
        const sessionInfo = await signIn({
            title:'Sign In',
            message:'You must sign in to change sharing settings.'
        });
        if (!sessionInfo) {return;}
        if (!this.editionName) {return;}
        const request:ShareRequest={
            token:sessionInfo.token,
            saveName:this.editionName,
            user
        };
        try {
            const response = await signedInCmd<ShareResponse>('share', 'Sharing', request);
            if (true !== response) {
                await showError('Network Error', `Error encountered while sharing`, response.error);
                console.error(response.error);
                return;
            }
        } catch (error) {
            await showError('Network Error', `Error encountered while unsharing`, error);
            return;
        }
        
        if (Array.isArray(this.shareList)) {
            this.shareList.push(user);
            this.updateSharingDlg();
        }
    }

    /** bring up subdialog for sharing with a specific person */
    async showShareWithUser():Promise<void> {
        const usernameField = createElement({t:'input',a:{type:'text',required:'true',placeholder:'Username',autocomplete:'username'},id:'shareWithUserDlgUsername'});
        const usernameWarnings = createElement({t:'div',css:['column'],a:{style:'color:red'}});
        const syncToButton = ()=>{
            const buttonElem = document.getElementById('shareWithUserButton');
            if (!(buttonElem instanceof HTMLButtonElement)) {return;}
            buttonElem.disabled = !usernameField.value;
        };
        const usernameWarn = ()=>{
            updateUsernameWarnings(usernameField.value, usernameWarnings, 'Username');
            syncToButton();
        };
        usernameField.addEventListener('change',usernameWarn);
        usernameField.addEventListener('input',usernameWarn);
        const shareWithUser = async ():Promise<void>=>{
            if (!validateUsername(usernameField.value)) {
                await showMessage('Share Error', 'Username not valid.');
                return;
            }
            try {
                await this.shareWithUser(usernameField.value);
            } catch (error) {
                await showError('Share Error', 'Something went wrong during sign-up:', error);
            }
        };
        const buttons = [
            {label:'Share',id:'shareWithUserButton',callback:shareWithUser,disabled:true},
            {label:'Cancel'}
        ];

        await showDialog<void>(
            document.activeElement,
            'share-with-user',
            [
                {t:'h1',txt:'Share with User'},
                {t:'div',css:['twoColumnGrid'],children:[
                    {t:'label',a:{'for':'shareWithUserDlgUsername'},txt:'Username'},
                    usernameField,
                ]},
                usernameWarnings
            ],
            buttons
        );
    }

    /** update dialog after changes */
    updateSharingDlg():void {
        if (!this.listDiv) {return;}
        if (!this.allButton) {return;}
        if (!this.addUserButton) {return;}
        if (!this.removeAllButton) {return;}
        if (!this.shareList) {return;}
        if (this.shareList === 'all') {
            this.listDiv.innerText = 'Everyone';
            this.allButton.disabled = true;
            this.addUserButton.disabled = true;
            this.removeAllButton.disabled = false;
        } else if (this.shareList.length === 0) {
            this.listDiv.innerText = 'No one';
            this.allButton.disabled = false;
            this.addUserButton.disabled = false;
            this.removeAllButton.disabled = true;
        } else {
            this.listDiv.innerText = '';
            for (const name of this.shareList) {
                this.listDiv.appendChild(createElement({t:'span',txt:name}));
                this.listDiv.appendChild(createElement({t:'button',txt:'Remove',events:{click:async ()=>{
                    await this.removeUser(name);
                }}}));
            }
            this.allButton.disabled = false;
            this.addUserButton.disabled = false;
            this.removeAllButton.disabled = false;
        }
    }
}

/**  */

/** show sharing dialog */
export default async function show(editionSaveName:string):Promise<void>{
    await new SharingDlg().open(editionSaveName);
}
