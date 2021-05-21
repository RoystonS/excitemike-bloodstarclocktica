/**
 * sign in to bloodstar clocktica
 * @module SignIn
 */
import {showError} from "./dlg/blood-message-dlg";
import {show as doSignInFlow} from "./dlg/sign-in-flow";
import { SessionInfo } from "./iam";

let sessionInfo:SessionInfo|null = null;

/** true when we have don't have an accesstoken or it is expired */
function accessTokenExpired():boolean{
    if (!sessionInfo){return true;}
    const timestamp = Date.now() / 1000 | 0;
    const leeway = 60;
    if ((timestamp - leeway) >= sessionInfo.expiration){return true;}
    return false;
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

function getStoredToken():SessionInfo|null{
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
 * prompt the user for a user+pass to sign in with
 * @returns Promise that resolves to auth info that worked or the null if user did not successfully sign in
 */
async function promptAndSignIn():Promise<SessionInfo|null>{
    const accessToken = await doSignInFlow("Sign in");
    if (!accessToken) {
        await showError('Error', 'Error encountered during sign-in', 'Network error or incorrect username or password.');
        return null;
    }
    return accessToken;
}

/**
 * sign in using saved info or prompting for user+pass if necessary
 * Loops until a valid sign-in occurs.
 * @returns promise that resolves to user info
 */
export async function signIn(force=false):Promise<SessionInfo> {
    sessionInfo = sessionInfo || getStoredToken();
    if (!force && sessionInfo && !accessTokenExpired()){return sessionInfo;}
    clearStoredToken();
    sessionInfo = null;

    while (!sessionInfo) {
        try {
            sessionInfo = await promptAndSignIn();
        } catch (error) {
            // TODO: better messaging when things go wrong
            await showError('Error', 'Error while signing in', error);
        }
    }
    storeToken(sessionInfo);
    return sessionInfo;
}

/** clear session info */
export function signOut():void{
    sessionInfo = null;
    clearStoredToken();
}

/**
 * store auth info for next time
 * TODO: this should probably store a session token instead
 */
function storeToken(accessToken:SessionInfo):void {
    const localStorage = window.localStorage;
    if (localStorage) {
        try{
            localStorage.setItem('accessToken', JSON.stringify(accessToken));
        } catch (error) {
            // ignore error
        }
    }
}

export default signIn;