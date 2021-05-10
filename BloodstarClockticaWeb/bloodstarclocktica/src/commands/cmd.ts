/**
 * send a command to the server
 * @module Cmd
 */

import { FieldType } from "../bind/base-binding";
import { spinner } from "../dlg/spinner-dlg";
import {show as showMessage, showError} from "../dlg/blood-message-dlg";

/**
 * send a command to the server, await response
 * Brings up the loading spinner during the operation
 */
 export default async function cmd(username:string, password:string, cmdName:string, spinnerMessage:string, body?:BodyInit|null|undefined):Promise<FieldType> {
    return await spinner('command', spinnerMessage, _cmd(username, password, cmdName, body));
}

/**
 * send a command to the server, await response 
 */
async function _cmd(username:string, password:string, cmdName:string, body?:BodyInit|null):Promise<FieldType> {
    let response:Response;
    const base64 = btoa(`${username}:${password}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>{
        controller.abort();
        // TODO: something to prevent getting many of these at once
        showMessage('Network Error', `Request timed out for command "${cmdName}"`);
    }, 15*1000);
    try {
        response = await fetch(`https://www.bloodstar.xyz/cmd/${cmdName}.php`, {
                method: 'POST',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json',
                    'Authorization': `Basic ${base64}`
                },
                mode: 'cors',
                credentials: 'include',
                signal: controller.signal,
                body
            });
        
        if (!response.ok) {
            const error = `${response.status}: (${response.type}) ${response.statusText}`;
            showError('Network Error', `Error encountered during command ${cmdName}`, error);
            console.error(error);
            return null;
        }
    } catch (error) {
        showError('Network Error', `Error encountered during command ${cmdName}`, error);
        return null;
    } finally {
        clearTimeout(timeoutId);
    }

    try {
        const responseText = await response.text();
        return JSON.parse(responseText);
    } catch (error) {
        showError('Error', `Error parsing server response JSON for command ${cmdName}`, error);
        console.error(error);
    }
    return {};
}