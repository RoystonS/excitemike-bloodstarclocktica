/**
 * send a command to the server
 * @module Cmd
 */

import { spinner } from "../dlg/spinner-dlg";

const TIMEOUT = 15*1000;
const MAXRETRIES = 1;

/**
 * send a command to the server, await response
 * Brings up the loading spinner during the operation
 * @param auth base64'd `${username}:${password}`
 */
 export default async function cmd<ResultType = unknown>(auth:string, cmdName:string, spinnerMessage:string, body?:BodyInit):Promise<ResultType> {
    return await spinner<ResultType>('command', spinnerMessage, _cmd<ResultType>(auth, cmdName, body, TIMEOUT, MAXRETRIES));
}

/**
 * wrap fetch with a timeout
 * @param auth base64'd `${username}:${password}`
 */
async function fetchWithTimeout(auth:string, cmdName:string, body:BodyInit|undefined, timeout:number):Promise<Response> {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(()=>{
        timedOut = true;
        controller.abort();
    }, timeout);
    
    try {
        return await fetch(`https://www.bloodstar.xyz/cmd/${cmdName}.php`, {
            method: 'POST',
            headers:{
                'Authorization': `Basic ${auth}`
            },
            mode: 'cors',
            credentials: 'include',
            signal: controller.signal,
            body
        });
    } catch (error) {
        if (timedOut) {throw `Command "${cmdName} timed out`;}
        throw `Network error during command "${cmdName}"`;
    } finally {
        clearTimeout(timeoutId)
    }
}

/**
 * wrap fetch to timeout and automatically retry
 * @param auth base64'd `${username}:${password}`
 */
async function fetchWithTimeoutAndRetry(auth:string, cmdName:string, body:BodyInit|undefined, timeout:number, maxRetries:number):Promise<Response> {
    while (maxRetries > 0) {
        try {
            return await fetchWithTimeout(auth, cmdName, body, timeout);
        } catch (e) {
            if (maxRetries <= 0) {throw e;}
            maxRetries--;
        }
    }
    return await fetchWithTimeout(auth, cmdName, body, timeout);
}

/**
 * send a command to the server, await response 
 * @param auth base64'd `${username}:${password}`
 */
async function _cmd<ResultType = unknown>(auth:string, cmdName:string, body:BodyInit|undefined, timeout:number, maxRetries:number):Promise<ResultType> {
    const response = await fetchWithTimeoutAndRetry(
        auth,
        cmdName,
        body,
        timeout,
        maxRetries
    );
    
    if (!response.ok) {
        throw new Error(`${response.status}: (${response.type}) ${response.statusText}`);
    }

    let responseText;
    try {
        responseText = await response.text();
    } catch (error) {
        throw new Error(`Error reading server response.`);
    }
    
    try {
        return JSON.parse(responseText);
    } catch (error) {
        throw new Error(`Error parsing server response JSON.`);
    }
}
