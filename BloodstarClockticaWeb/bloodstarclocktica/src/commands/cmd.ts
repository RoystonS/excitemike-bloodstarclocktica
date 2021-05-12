/**
 * send a command to the server
 * @module Cmd
 */

import { spinner } from "../dlg/spinner-dlg";
import {show as showMessage, showError} from "../dlg/blood-message-dlg";

/**
 * send a command to the server, await response
 * Brings up the loading spinner during the operation
 */
 export default async function cmd(username:string, password:string, cmdName:string, spinnerMessage:string, body?:BodyInit|null|undefined):Promise<unknown> {
    return await spinner('command', spinnerMessage, _cmd(username, password, cmdName, body));
}

/**
 * send a command to the server, await response 
 */
async function _cmd(username:string, password:string, cmdName:string, body?:BodyInit|null):Promise<unknown> {
    let response:Response;
    const base64 = btoa(`${username}:${password}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>{
        controller.abort();
        // intentional floating promise - TODO: something to prevent getting many of these at once
        void showMessage('Network Error', `Request timed out for command "${cmdName}"`);
    }, 15*1000);
    try {
        response = await fetch(`https://www.bloodstar.xyz/cmd/${cmdName}.php`, {
                method: 'POST',
                headers:{
                    'Authorization': `Basic ${base64}`
                },
                mode: 'cors',
                credentials: 'include',
                signal: controller.signal,
                body
            });
        
        if (!response.ok) {
            const error = `${response.status}: (${response.type}) ${response.statusText}`;
            // intentional floating promise - TODO: something to prevent getting many of these at once
            void showError('Network Error', `Error encountered during command ${cmdName}`, error);
            console.error(error);
            return null;
        }
    } catch (error) {
        // intentional floating promise - TODO: something to prevent getting many of these at once
        void showError('Network Error', `Error encountered during command ${cmdName}`, error);
        return null;
    } finally {
        clearTimeout(timeoutId);
    }

    try {
        const responseText = await response.text();
        return JSON.parse(responseText);
    } catch (error) {
        // intentional floating promise - TODO: something to prevent getting many of these at once
        void showError('Error', `Error parsing server response JSON for command ${cmdName}`, error);
        console.error(error);
    }
    return {};
}