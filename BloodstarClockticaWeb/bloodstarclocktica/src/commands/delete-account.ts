/**
 * permanently delete a user account
 * @module DeleteAccount
 */

import { showError } from "../dlg/blood-message-dlg";
import signIn, { signedInCmd } from "../sign-in";
import { show as getConfirmation } from "../dlg/yes-no-dlg";

type DeleteAccountResult = {error:string}|true;


/** user chose to delete their account */
export async function deleteAccount():Promise<boolean> {
    const sessionInfo = await signIn(true); // TODO: make clear in the dialog that this is for deletion
    if (!await getConfirmation(
        'Confirm Delete',
        `Are you sure you'd like to the account associated with username "${sessionInfo.username}" and email "${sessionInfo.email}"? You will not be able to recover your account!`,
        {
            yesLabel: `Delete my account`,
            noLabel:'Cancel',
            checkboxMessage:`Yes, I am certain I want to permanently delete my account`,
        }))
    { return false; }
    
    const result = await signedInCmd('deleteaccount', 'Deleting account', {token:sessionInfo.token}) as DeleteAccountResult;
    
    if (true === result) {
        return !!await signIn(true);
    }

    const {error} = result;
    await showError('Error', 'Something went wrong while attempting to delete your account.', error);
    return false;
}