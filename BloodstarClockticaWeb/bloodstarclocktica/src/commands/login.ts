/**
 * log in to bloodstar clocktica
 * @module Login
 */
import cmd from './cmd';
import {showError} from "../dlg/blood-message-dlg";
import {show as showLoginDlg} from "../dlg/blood-login-dlg";

type LoginReturn = {success:boolean};


/**
 * login using saved info or prompting for user+pass if necessary
 * Loops until a valid login occurs.
 * @returns promise that resolves to auth info
 */
export default async function login():Promise<string> {
    let auth = await loginFromSaved();
    if (auth){return auth;}

    while (!auth) {
        auth = await promptAndLogin();
    }

    // once login succeeds, store base64ed userpass for next time
    if (auth) {
        storeAuth(auth);
    }
    return auth;
}

/**
 * if saved auth is found, first try to automatically log in with that
 * @returns Promise that resolves to auth info that worked or the empty string if user did not successfully log in
 */
async function loginFromSaved():Promise<string> {
    const localStorage = window.localStorage;
    if (!localStorage){return '';}

    // check for stored userpass. try to login with that if present
    const auth = localStorage.getItem('auth');
    if (!auth) {return '';}
    if (await loginWith(auth)) {
        return auth;
    }

    // if login from stored fails, remove from storage
    localStorage.removeItem('auth');
    return '';
}

/**
 * attempt to log in
 * Brings up the loading spinner during the operation
 * @param auth base64'd `${username}:${password}`
 */
async function loginWith(auth:string):Promise<boolean> {
    try {
        const {success} = await cmd(auth, 'login', `Logging in`) as LoginReturn;
        return success;
    } catch (error) {
        //await showError('Network Error', `Error encountered during login`, error);
        return false;
    }
}

/**
 * prompt the user for a user+pass to log in with
 * @returns Promise that resolves to auth info that worked or the empty string if user did not successfully log in
 */
async function promptAndLogin():Promise<string>{
    const loginInfo = await showLoginDlg("Enter username and password");
    if (loginInfo) {
        const {username,password} = loginInfo;
        const auth = btoa(`${username}:${password}`);
        if (await loginWith(auth)) {
            return auth;
        }
    }
    await showError('Error', 'Error encountered during login', 'Network error or incorrect username or password.');
    return '';
}

/**
 * store auth info for next time
 * @param auth auth info to save
 */
function storeAuth(auth:string):void {
    const localStorage = window.localStorage;
    if (localStorage) {
        try{
            localStorage.setItem('auth', auth);
        } catch (error) {
            // ignore error
        }
    }
}