/**
 * sign in to bloodstar clocktica
 * @module SignIn
 */
import {showError} from "./dlg/blood-message-dlg";
import {show as doSignInFlow} from "./dlg/sign-in-flow";
import { AccessToken } from "./iam";

let accessToken:AccessToken|null = null;

/** true when we have don't have an accesstoken or it is expired */
function accessTokenExpired():boolean{
    if (!accessToken){return true;}
    const timestamp = Date.now() / 1000 | 0;
    const leeway = 60;
    if ((timestamp - leeway) >= accessToken.expiration){return false;}
    return true;
}

function clearStoredToken():void{
    const localStorage = window.localStorage;
    if (localStorage) {
        try{
            localStorage.removeItem('accessToken');
        } catch (error) {
            // ignore error
        }
    }
}

function getStoredToken():AccessToken|null{
    const localStorage = window.localStorage;
    if (localStorage) {
        try{
            const fromStorage = localStorage.getItem('accessToken');
            if (!fromStorage) {return null;}
            return JSON.parse(fromStorage);
        } catch (error) {
            // ignore error
        }
    }
    return null;
}

/**
 * sign in using saved info or prompting for user+pass if necessary
 * Loops until a valid sign-in occurs.
 * @returns promise that resolves to true
 */
export default async function signIn(force=false):Promise<boolean> {
    accessToken = accessToken || getStoredToken();
    if (!force && !accessTokenExpired()){return true;}
    clearStoredToken();
    accessToken = null;

    while (!accessToken) {
        try {
            accessToken = await promptAndSignIn();
        } catch (error) {
            await showError('Error', 'Error while signing in', error);
        }
    }
    storeToken(accessToken);
    return true;
}

/**
 * prompt the user for a user+pass to sign in with
 * @returns Promise that resolves to auth info that worked or the null if user did not successfully sign in
 */
async function promptAndSignIn():Promise<AccessToken|null>{
    const accessToken = await doSignInFlow("Sign in");
    if (!accessToken) {
        await showError('Error', 'Error encountered during sign-in', 'Network error or incorrect username or password.');
        return null;
    }
    return accessToken;
}

/**
 * store auth info for next time
 * TODO: this should probably store a session token instead
 */
function storeToken(accessToken:AccessToken):void {
    const localStorage = window.localStorage;
    if (localStorage) {
        try{
            localStorage.setItem('accessToken', JSON.stringify(accessToken));
        } catch (error) {
            // ignore error
        }
    }
}