/**
 * sign in to bloodstar clocktica
 * @module SignIn
 */
import cmd from "./commands/cmd";
import {showError} from "./dlg/blood-message-dlg";
import {show as doSignInFlow, SignInFlowOptions} from "./dlg/sign-in-flow";
import { SessionInfo } from "./iam";
import { updateUserDisplay } from "./menu";
import { isRecord } from "./util";
import {show as getConfirmation, YesNoOptions} from "./dlg/yes-no-dlg";

export type SignInOptions = SignInFlowOptions & {
    /** true to force a new sign-in instead of reusing existing token */
    force?:boolean;
};

let gSessionInfo:SessionInfo|null = null;

/** true when we have don't have an accesstoken or it is expired */
export function accessTokenExpired(sessionInfo:SessionInfo|null):boolean {
    if (!sessionInfo) {return true;}
    const timestamp = Date.now() / 1000 | 0;
    const leeway = 60;
    if ((timestamp - leeway) >= sessionInfo.expiration) {return true;}
    return false;
}

function clearStoredToken():void {
    const {localStorage} = window;
    try {
        localStorage.removeItem('accessToken');
    } catch (error: unknown) {
        console.error(error);
    }
}

export function getStoredToken():SessionInfo|null {
    const {localStorage} = window;
    try {
        const fromStorage = localStorage.getItem('accessToken');
        if (!fromStorage) {return null;}
        const x = JSON.parse(fromStorage);
        if (!isRecord(x)) {
            return null;
        }
        return x as SessionInfo;
    } catch (error: unknown) {
        // ignore error
    }
    return null;
}

/**
 * prompt the user for a user+pass to sign in with
 * updates sessionInfo
 * @returns Promise that resolves to whether user successfully signed in
 */
async function promptAndSignIn(options?:SignInFlowOptions):Promise<boolean> {
    try {
        gSessionInfo = await doSignInFlow(options);
        return true;
    } catch (error: unknown) {
        await showError('Error', 'Error encountered during sign-in', error);
    }
    return false;
}

/**
 * execute a command, signing in first if that looks necessary
 * Note that body is not pre-stringified like it is with cmd()
 * @returns promise that resolves to user info
 */
// TODO: remove in favor of genericCmd
export async function signedInCmd<ResultType>(cmdName:string, spinnerMessage:string, body:{token:string}):Promise<ResultType> {
    gSessionInfo = gSessionInfo ?? getStoredToken();
    while (accessTokenExpired(gSessionInfo)) {
        await signIn({force:true, message:'Please sign in to continue.'});
        if (gSessionInfo) {
            body.token = gSessionInfo.token;
        }
    }

    const bodyClone = {...body};
    let cmdResult = await cmd<ResultType|'signInRequired'>(cmdName, spinnerMessage, JSON.stringify(bodyClone));
    while (cmdResult==='signInRequired') {
        const signInResult = await signIn({force:true, message:'Please sign in to continue.'});
        if (signInResult) {
            bodyClone.token = signInResult.token;
        }
        cmdResult = await cmd<ResultType|'signInRequired'>(cmdName, spinnerMessage, JSON.stringify(bodyClone));
    }
    return cmdResult;
}

/**
 * sign in using saved info or prompting for user+pass if necessary
 * If canCancel is false in options, this loops until a valid sign-in occurs.
 * @returns promise that resolves to user info
 */
export async function signIn(options?:SignInOptions):Promise<SessionInfo|null> {
    const force = Boolean(options?.force);
    gSessionInfo = gSessionInfo ?? getStoredToken();
    if (!force && !accessTokenExpired(gSessionInfo)) {
        updateUserDisplay(gSessionInfo);
        return gSessionInfo;
    }
    clearStoredToken();
    gSessionInfo = null;

    if (options?.canCancel === false) {
        let signedIn = false;
        while (!signedIn) {
            try {
                signedIn = await promptAndSignIn(options);
            } catch (error: unknown) {
                await showError('Error', 'Error while signing in', error);
            }
        }
    } else {
        await promptAndSignIn(options);
    }

    storeToken(gSessionInfo);

    updateUserDisplay(gSessionInfo);

    return gSessionInfo;
}

/**
 * sign in and do a confirmation popup
 * @returns SessionInfo if they are both signed in AND said yes to the confirmation dialog, otherwise null
 */
// TODO: remove in favor of genericCmd
export async function signInAndConfirm(
    signInOptions:SignInOptions,
    confirmOptions:YesNoOptions
):Promise<SessionInfo|null> {
    const sessionInfo = await signIn(signInOptions);
    if (!sessionInfo) {return null;}
    if (!await getConfirmation(confirmOptions)) { return null; }
    return sessionInfo;
}

/** clear session info */
export function signOut():void {
    gSessionInfo = null;
    clearStoredToken();
    updateUserDisplay(null);
}

/**
 * store auth info for next time
 */
function storeToken(accessToken:SessionInfo | null):void {
    const {localStorage} = window;
    try {
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
    } catch (error: unknown) {
        // ignore error
    }
}

export default signIn;