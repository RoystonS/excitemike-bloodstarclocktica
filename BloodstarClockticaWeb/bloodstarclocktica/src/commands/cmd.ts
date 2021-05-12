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
 */
 export default async function cmd(username:string, password:string, cmdName:string, spinnerMessage:string, body?:BodyInit):Promise<unknown> {
    return await spinner('command', spinnerMessage, _cmd(username, password, cmdName, body, TIMEOUT, MAXRETRIES));
}

/** wrap fetch to timeout and automatically retry */
async function fetchWithTimeoutAndRetry(username:string, password:string, cmdName:string, body:BodyInit|undefined, timeout:number, maxRetries:number):Promise<Response> {
    const base64 = btoa(`${username}:${password}`);
    const controller = new AbortController();
    return await new Promise((resolve,reject)=>{
        const timeoutId = setTimeout(()=>{
            controller.abort();
            if (maxRetries > 0) {
                console.log(`Request timed out for command "${cmdName}. ${maxRetries} retries remaining"`);
                resolve(fetchWithTimeoutAndRetry(username, password, cmdName, body, timeout, maxRetries - 1));
            } else {
                reject(`Request timed out for command "${cmdName}"`);
            }
        }, timeout);

        fetch(`https://www.bloodstar.xyz/cmd/${cmdName}.php`, {
                method: 'POST',
                headers:{
                    'Authorization': `Basic ${base64}`
                },
                mode: 'cors',
                credentials: 'include',
                signal: controller.signal,
                body
            })
            .finally(()=>clearTimeout(timeoutId))
            .then(resolve, reject);
    });
}

/**
 * send a command to the server, await response 
 */
async function _cmd(username:string, password:string, cmdName:string, body:BodyInit|undefined, timeout:number, maxRetries:number):Promise<unknown> {
    const response = await fetchWithTimeoutAndRetry(
        username,
        password,
        cmdName,
        body,
        timeout,
        maxRetries
    );
    
    if (!response.ok) {
        throw new Error(`${response.status}: (${response.type}) ${response.statusText}`);
    }

    const responseText = await response.text();
    
    try {
        return JSON.parse(responseText);
    } catch (error) {
        throw new Error(`Error parsing server response JSON.`);
    }
}