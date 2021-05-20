/**
 * module for working with identity and access management stuff
 * @module Iam
 */

import cmd from "./commands/cmd";
import { show as showMessage, showError } from "./dlg/blood-message-dlg";

export type SessionInfo = {token:string,expiration:number,username:string,email:string};
type CheckSignUpConfirmedData = {usernameOrEmail:string};
type ConfirmPasswordResetData = {usernameOrEmail:string};
type ResendSignUpConfirmationData = {usernameOrEmail:string};
type ResetPasswordData = {usernameOrEmail:string};
type ConfirmResponse = {error?:string,confirmed?:boolean};
type EmailResponse = {error?:string,email?:string};
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
 * Check whether the user has confirmed sign up
 * @returns Promise that resolves to true if sign-up for the specified user was confirmed
 */
export async function checkSignUpConfirmed(usernameOrEmail:string):Promise<boolean>{
    const data:CheckSignUpConfirmedData = {usernameOrEmail};
    const payload = JSON.stringify(data);
    const {error,confirmed} = await cmd('issignupconfirmed', 'Checking sign up confirmation', payload) as ConfirmResponse;
    if (error) {
        await showError('Error', `Error encountered while checking sign-up confirmation for ${usernameOrEmail}`, error);
        return false;
    }
    return !!confirmed;
}

/**
 * Check whether the user is still marked as needing a password reset
 * @returns Promise that resolves to true if the user's password is ok
 */
export async function confirmPasswordReset(usernameOrEmail:string):Promise<boolean>{
    const data:ConfirmPasswordResetData = {usernameOrEmail};
    const payload = JSON.stringify(data);
    const {error,confirmed} = await cmd('confirmpassreset', 'Confirming password reset', payload) as ConfirmResponse;
    if (error) {
        await showError('Error', `Error encountered while confirming password reset for ${usernameOrEmail}`, error);
        return false;
    }
    return !!confirmed;
}

/**
 * send the sign up confirmation email again
 * @returns email address to which a confirmation email was sent, or the empty string
 */
export async function resendSignUpConfirmation(usernameOrEmail:string):Promise<string>{
    const data:ResendSignUpConfirmationData = {usernameOrEmail};
    const payload = JSON.stringify(data);
    const {error,email} = await cmd('resendconf', 'Requesting signup confirmation email', payload) as EmailResponse;
    if (error) {
        await showError('Error', `Error encountered while requesting signup confirmation email for ${usernameOrEmail}`, error);
        return '';
    }
    return email||'';
}

/**
 * send the reset message
 * @returns promise that resolves to the email address to which the password reset message was sent, or the empty string
 */
export async function sendPasswordReset(usernameOrEmail:string):Promise<string>{
    const passwordResetData:ResetPasswordData = {usernameOrEmail};
    const payload = JSON.stringify(passwordResetData);
    const {error,email} = await cmd('resetpwd', 'Requesting password reset', payload) as EmailResponse;
    if (error) {
        await showError('Error', `Error encountered while trying to reset password for ${usernameOrEmail}`, error);
        return '';
    }
    return email||'';
}

/**
 * do sign in
 * @param username 
 * @param password 
 * @returns Promise that resolves to an access token
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
