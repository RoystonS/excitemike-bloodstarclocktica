/**
 * Create script.json
 * @module Publish
 */
import cmd from './cmd';
import {Edition} from '../model/edition';
import { showError } from '../dlg/blood-message-dlg';
import { AriaDialog } from '../dlg/aria-dlg';

type PublishReturn = {error?:string,script:string,almanac:string};

/**
 * publish the edition
 * @param auth base64'd `${username}:${password}`
 */
export default async function publish(auth:string, edition:Edition):Promise<boolean> {
    type PublishData = {
        saveName:string
    };
    
    const saveName = edition.saveName.get();
    const saveData:PublishData = {
        saveName: saveName
    };
    const payload = JSON.stringify(saveData);

    let response:PublishReturn;
    try {
        response = await cmd(auth, 'publish', `Publishing ${edition.saveName.get()}`, payload) as PublishReturn;
    } catch (error) {
        await showError('Error', 'Error encountered during publish', error);
        return false;
    }
    if (!response) {return false;}
    const {error} = response;
    if (error) {
        await showError('Error', 'Error encountered during publish', error);
        return false;
    }
    const {script,almanac} = response;

    await new AriaDialog<void>().baseOpen(
        null,
        'publishComplete', 
        [
            {t:'p',css:['title'],txt:'Publish Complete'},
            {
                t:'div',
                css:['uploadCompleteGrid'],
                children:[
                    {t:'span',txt:'script:'},
                    {t:'a',a:{'href':script,'target':'_blank'},txt:script},
                    {t:'span',txt:'almanac:'},
                    {t:'a',a:{'href':almanac,'target':'_blank'},txt:almanac},
                ]
            }
        ],
        [{label:'OK'}]
    );

    return true;
}