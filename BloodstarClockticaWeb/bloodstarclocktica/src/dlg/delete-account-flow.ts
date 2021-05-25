/**
 * dialog chain for deleting your account
 * @module DeleteAccountFlow
 */
import { show as showMessage, showError } from "../dlg/blood-message-dlg";
import signIn, { signedInCmd } from "../sign-in";
import { show as getConfirmation } from "../dlg/yes-no-dlg";
import { AriaDialog } from "../dlg/aria-dlg";
import { createElement } from "../util";
type DeleteAccountData = {token:string,password:string};
type DeleteAccountResult = {error:string}|true;

/** make sure the user really really wants to do that */
async function confirmDeleteAccount():Promise<boolean>{
    const sessionInfo = await signIn(false); // TODO: make clear in the dialog that this is for deletion
    if (!await getConfirmation(
        'Confirm Delete',
        `Are you sure you'd like to the account associated with username "${sessionInfo.username}" and email "${sessionInfo.email}"? You will not be able to recover your account!`,
        {
            yesLabel: `Delete my account`,
            noLabel:'Cancel',
            checkboxMessage:`Yes, I am certain I want to permanently delete my account`,
        }))
    { return false; }
    return true;
}

/** user chose to delete their account */
export async function deleteAccount():Promise<boolean> {
    const sessionInfo = await signIn(false); // TODO: make clear in the dialog that this is for deletion
    if (!confirmDeleteAccount()){return false;}

    const password = await getPassword();
    if (!password){return false;}
    
    const commandData:DeleteAccountData = {
        token:sessionInfo.token,
        password
    };
    const result = await signedInCmd('deleteaccount', 'Deleting account', commandData) as DeleteAccountResult;
    
    if (true === result) {
        await showMessage('Done', 'Account deleted');
        return !!await signIn(true);
    }

    const {error} = result;
    await showError('Error', 'Something went wrong while attempting to delete your account.', error);
    return false;
}

class PasswordDlg extends AriaDialog<string> {
    async open():Promise<string> {
        const passwordField = createElement({
            t:'input',
            a:{type:'password',required:'true',placeholder:'Password',autocomplete:'current-password'}
        });
        passwordField.addEventListener('keyup', (event:KeyboardEvent):void=>{
            switch (event.code)
            {
                case 'NumpadEnter':
                case 'Enter':
                    event.preventDefault();
                    this.close(passwordField.value);
                    break;
            }
        });
        return await this.baseOpen(
            document.activeElement,
            'pwd-for-del-accnt',
            [
                {t:'h1',txt:'Enter Password'},
                {t:'p',txt:'Enter your password ton continue deleting your account.'},
                passwordField],
            [{label:'OK',id:'pwdOkButton',callback:()=>passwordField.value},
            {label:'Cancel'}]
        )||'';
    }
}

/** prompt user for their password before letting them delete an account */
async function getPassword():Promise<string>{
    return await new PasswordDlg().open();
}