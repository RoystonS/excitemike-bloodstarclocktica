/**
 * dialogs for forgotten password
 * @module ForgotPasswordFlow
 */
import { createElement } from "../util";
import {showDialog} from './aria-dlg';
import {confirmPasswordReset, sendPasswordReset} from '../iam';

// TODO: enter code rather than click link

/**
 * bring up forgot-password dialogs
 * @returns promise that resolves to true if the password was successfully reset
 */
async function show():Promise<boolean> {
    const usernameField = createElement({t:'input',a:{type:'text',required:'true',placeholder:'Username or email',autocomplete:'email'},id:'requestResetDlgUsername'});
    const email = await showDialog<string>(
        null,
        'reset-password',
        [
            {t:'h1',txt:'Forgot your password?'},
            {t:'p',txt:'Enter your username or email below and we will send a message to reset your password.'},
            usernameField
        ],
        [
            {label:'Reset my password',callback:()=>sendPasswordReset(usernameField.value)},
            {label:'Cancel'}
        ]
    );
    if (!email){return false;}

    let passwordHasBeenReset = false;
    let giveUp = false;
    while (!passwordHasBeenReset && !giveUp) {
        await showDialog<void>(
            null,
            'reset-sent',
            [
                {t:'p',txt:`An email was sent to ${email} with instructions for resetting your password.`}
            ],
            [
                {label:'Continue',callback:async()=>passwordHasBeenReset=await confirmPasswordReset(email)},
                {label:'Cancel',callback:()=>{giveUp=true;}}
            ]
        );
    }
    return passwordHasBeenReset;
}

export default show;
