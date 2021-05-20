/**
 * module for working with identity and access management stuff
 * @module Iam
 */

import cmd from "./commands/cmd";
import { show as showMessage, showError } from "./dlg/blood-message-dlg";

export type SessionInfo = {token:string,expiration:number,username:string,email:string};
type ConfirmEmailData = {code:string,email:string};
type ConfirmPasswordResetData = {usernameOrEmail:string};
type ResendSignUpConfirmationData = {usernameOrEmail:string};
type ResetPasswordData = {usernameOrEmail:string};
type ConfirmEmailResponse = {error:string}|{token:string,expiration:number,username:string,email:string}|'alreadyConfirmed'|'notSignedUp'|'expired'|'badCode';
type ResetPasswordResponse = {error:string}|true;
type EmailResponse = {error:string}|{email:string};
type SignUpResponse = {error:string}|'usernameTaken'|'emailTaken'|true;
type SignInData = {
    usernameOrEmail:string,
    password:string
};
type SignInResponse = {error?:string,token?:string,expiration?:number,username?:string,email?:string};
type SignUpData = {
    username:string,
    password:string,
    email:string
};

/**
 * last step of creating an account
 * @returns Promise that resolves to session information if sign-up for the specified user completes
 */
export async function confirmEmail(email:string, code:string):Promise<SessionInfo|null>{
    const data:ConfirmEmailData = {code, email};
    const payload = JSON.stringify(data);
    const response = await cmd('confirm', 'Checking sign up confirmation', payload) as ConfirmEmailResponse;
    if (typeof response === 'string'){
        switch (response) {
            // treat like success
            case 'alreadyConfirmed':
                return null;
            case 'badCode':
                await showMessage('Error', 'Confirmation code was not correct.');
                return null;
            case 'expired':
                await showMessage('Error', 'Confirmation code is expired.');
                return null;
            case 'notSignedUp':
                await showMessage('Error', 'User not found.');
                return null;
        }
    }
    if ('error' in response) {
        await showError('Error', `Error encountered while confirming ${email}`, response.error);
        return null;
    }
    return response;
}

/**
 * Check whether the user is still marked as needing a password reset
 * @returns Promise that resolves to true if the user's password is ok
 */
export async function confirmPasswordReset(usernameOrEmail:string):Promise<boolean>{
    const data:ConfirmPasswordResetData = {usernameOrEmail};
    const payload = JSON.stringify(data);
    const response = await cmd('confirmpassreset', 'Confirming password reset', payload) as ResetPasswordResponse;
    if (true===response){return true;}
    const {error} = response;
    await showError('Error', `Error encountered while confirming password reset for ${usernameOrEmail}`, error);
    return false;
}

/**
 * send the sign up confirmation email again
 * @returns email address to which a confirmation email was sent, or the empty string
 */
export async function resendSignUpConfirmation(usernameOrEmail:string):Promise<string>{
    // TODO: implement server side
    const data:ResendSignUpConfirmationData = {usernameOrEmail};
    const payload = JSON.stringify(data);
    const response = await cmd('resendconf', 'Requesting signup confirmation email', payload) as EmailResponse;
    if ('error' in response) {
        await showError('Error', `Error encountered while requesting signup confirmation email for ${usernameOrEmail}`, response.error);
        return '';
    }
    return response.email;
}

/**
 * send the reset message
 * @returns promise that resolves to the email address to which the password reset message was sent, or the empty string
 */
export async function sendPasswordReset(usernameOrEmail:string):Promise<string>{
    const passwordResetData:ResetPasswordData = {usernameOrEmail};
    const payload = JSON.stringify(passwordResetData);
    const response = await cmd('requestreset', 'Requesting password reset', payload) as EmailResponse;
    if ('error' in response) {
        await showError('Error', `Error encountered while trying to reset password for ${usernameOrEmail}`, response.error);
        return '';
    }
    return response.email;
}

/**
 * do sign in
 * @param username 
 * @param password 
 * @returns Promise that resolves to session information
 */
export async function signIn(usernameOrEmail:string, password:string):Promise<SessionInfo|null>{
    const signInData:SignInData = {
        usernameOrEmail,
        password
    };
    const payload = JSON.stringify(signInData);
    const {error,token,expiration,username,email} = await cmd('signin', 'Signing in', payload) as SignInResponse;
    if (error) {
        await showError('Error', `Error encountered while trying to sign in ${usernameOrEmail}`, error);
        return null;
    }
    if (!token || !expiration || !username || !email) {return null;}
    return {token,expiration,username,email};
}

/**
 * send the request for signing up
 * @returns email address to which a confirmation email was sent, or the empty string
 */
export async function signUp(
    username:string,
    password:string,
    email:string
):Promise<string>{
    const signUpData:SignUpData = {
        username,
        password,
        email
    };
    const payload = JSON.stringify(signUpData);
    const response = await cmd('signup', 'Signing up', payload) as SignUpResponse;
    if (true === response) {
        return email||'';
    }
    if (response === 'usernameTaken') {
        await showMessage('Try Again', `Username ${username} is already taken.`);
        return '';
    }
    if (response === 'emailTaken') {
        await showMessage('Try Again', `Email address ${email} is already in use.`);
        return '';
    }
    const {error} = response;
    await showError('Error', `Error encountered while trying to sign up ${username} / ${email}`, error);
    return '';
}
