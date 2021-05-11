/**
 * Create script.json
 * @module Publish
 */
import cmd from './cmd';
import {Edition} from '../model/edition';
import { showError } from '../dlg/blood-message-dlg';
import { AriaDialog } from '../dlg/aria-dlg';

type PublishReturn = {error?:string,script:string,almanac:string};

/** publish the edition */
export default async function publish(username:string, password:string, edition:Edition):Promise<boolean> {
    type PublishData = {
        saveName:string
    };
    
    const saveName = edition.saveName.get();
    const saveData:PublishData = {
        saveName: saveName
    };
    const payload = JSON.stringify(saveData);
    const response = await cmd(username, password, 'publish', `Publishing ${edition.saveName.get()}`, payload) as PublishReturn;
    if (!response) {return false;}
    const {error} = response;
    if (error) {
        showError('Error', 'Error encountered during publish', error);
        return false;
    }
    const {script,almanac} = response;

    // intentionally not awaiting this promise
    new AriaDialog<void>().baseOpen(
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
        [{label:'OK', callback:() => Promise.resolve(null)}]
    );

    return true;
}