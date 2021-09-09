/**
 * send a command to the server
 * @module Cmd
 */

import { spinner } from "../dlg/spinner-dlg";

const TIMEOUT = 15*1000;
const MAXRETRIES = 1;

export type UserPass = {username:string; password:string};

/**
 * send a command to the server, await response
 * Brings up the loading spinner during the operation
 */
export default async function cmd<ResultType = unknown>(cmdName:string, spinnerMessage:string, body?:BodyInit):Promise<ResultType> {
    return spinner<ResultType>(spinnerMessage, spinnerMessage, _cmd<ResultType>(cmdName, body, TIMEOUT, MAXRETRIES));
}

/**
 * wrap fetch with a timeout
 */
async function fetchWithTimeout(cmdName:string, body:BodyInit|undefined, timeout:number):Promise<Response> {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(()=>{
        timedOut = true;
        controller.abort();
    }, timeout);

    return fetch(`https://www.bloodstar.xyz/api/${cmdName}.php`, {
        method: 'POST',
        mode: 'cors',
        signal: controller.signal,
        body
    }).catch(()=>{
        throw new Error(timedOut?`Command "${cmdName}"" timed out`:`Network error during command "${cmdName}"`);
    }).finally(()=>{
        clearTimeout(timeoutId);
    });
}

/**
 * wrap fetch to timeout and automatically retry
 */
async function fetchWithTimeoutAndRetry(cmdName:string, body:BodyInit|undefined, timeout:number, maxRetries:number):Promise<Response> {
    let retriesLeft = maxRetries;
    while (retriesLeft > 0) {
        try {
            return await fetchWithTimeout(cmdName, body, timeout);
        } catch (e: unknown) {
            if (maxRetries <= 0) {throw e;}
            retriesLeft--;
        }
    }
    return fetchWithTimeout(cmdName, body, timeout);
}

/**
 * send a command to the server, await response
 */
async function _cmd<ResultType = unknown>(cmdName:string, body:BodyInit|undefined, timeout:number, maxRetries:number):Promise<ResultType> {
    const response = await fetchWithTimeoutAndRetry(
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
    } catch (error: unknown) {
        throw new Error(`Error reading server response.`);
    }

    try {
        return JSON.parse(responseText);
    } catch (error: unknown) {
        throw new Error(`Error parsing server response JSON.`);
    }
}
