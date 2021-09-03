/**
 * sign in to bloodstar clocktica
 * @module SignIn
 */
import cmd from "./commands/cmd";
import {showError} from "./dlg/blood-message-dlg";
import {show as doSignInFlow, SignInFlowOptions} from "./dlg/sign-in-flow";
import { SessionInfo } from "./iam";
import { updateUserDisplay } from "./menu";

type SignInOptions = SignInFlowOptions & {
    /** true to force a new sign-in instead of reusing existing token */
    force?:boolean
};

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
        try {
            localStorage.removeItem('accessToken');
        } catch (error) {
            console.error(error);
        }
    }
}

function getStoredToken():SessionInfo|null{
    const localStorage = window.localStorage;
    if (localStorage) {
        try {
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
 * updates sessionInfo
 * @returns Promise that resolves to whether user successfully signed in
 */
async function promptAndSignIn(options?:SignInFlowOptions):Promise<boolean>{
    try {
        sessionInfo = await doSignInFlow(options);
        return true;
    } catch (error) {
        await showError('Error', 'Error encountered during sign-in', error);
    }
    return false;
}

/**
 * execute a command, signing in first if that looks necessary
 * Note that body is not pre-stringified like it is with cmd()
 * @returns promise that resolves to user info
 */
export async function signedInCmd<ResultType>(cmdName:string, spinnerMessage:string, body:{token:string}):Promise<ResultType> {
    // TODO: I always wrap this in a try. Let's move the try in here.
    sessionInfo = sessionInfo || getStoredToken();
    while (!sessionInfo || accessTokenExpired()) {
        await signIn({force:true, message:'Please sign in to continue.'});
        if (sessionInfo){
            body.token = sessionInfo.token;
        }
    }

    const bodyClone = {...body};
    let result = await cmd<ResultType|'signInRequired'>(cmdName, spinnerMessage, JSON.stringify(bodyClone));
    while (result==='signInRequired') {
        await signIn({force:true, message:'Please sign in to continue.'});
        if (sessionInfo){
            bodyClone.token = sessionInfo.token;
        }
        result = await cmd<ResultType|'signInRequired'>(cmdName, spinnerMessage, JSON.stringify(bodyClone));
    }
    return result;
}

/**
 * sign in using saved info or prompting for user+pass if necessary
 * If canCancel is false in options, this loops until a valid sign-in occurs.
 * @returns promise that resolves to user info
 */
export async function signIn(options?:SignInOptions):Promise<SessionInfo|null> {
    const force = Boolean(options?.force);
    sessionInfo = sessionInfo || getStoredToken();
    if (!force && sessionInfo && !accessTokenExpired()){
        updateUserDisplay(sessionInfo);
        return sessionInfo;
    }
    clearStoredToken();
    sessionInfo = null;

    if (options?.canCancel !== false) {
        await promptAndSignIn(options);
    } else {
        while (!sessionInfo) {
            try {
                await promptAndSignIn(options);
            } catch (error) {
                await showError('Error', 'Error while signing in', error);
            }
        }
    }

    storeToken(sessionInfo);

    updateUserDisplay(sessionInfo);

    return sessionInfo;
}

/** clear session info */
export function signOut():void{
    sessionInfo = null;
    clearStoredToken();
    updateUserDisplay(null);
}

/**
 * store auth info for next time
 */
function storeToken(accessToken:SessionInfo | null):void {
    const localStorage = window.localStorage;
    if (localStorage) {
        try {
            localStorage.setItem('accessToken', JSON.stringify(accessToken));
        } catch (error) {
            // ignore error
        }
    }
}

export default signIn;