/**
 * Create script.json
 * @module Publish
 */
import {Edition} from '../model/edition';
import { showError } from '../dlg/blood-message-dlg';
import { AriaDialog } from '../dlg/aria-dlg';
import signIn, { signedInCmd } from '../sign-in';

type PublishData = {
    saveName:string,
    token:string,
};
type PublishReturn = {error?:string,script:string,almanac:string};

/**
 * publish the edition
 */
export default async function publish(edition:Edition):Promise<boolean> {
    const sessionInfo = await signIn({
        title:'Sign In to Publish',
        message:'You must be signed in to publish.'
    });
    if (!sessionInfo){return false;}
    const saveName = edition.saveName.get();
    const saveData:PublishData = {
        token:sessionInfo.token,
        saveName: saveName
    };

    let response:PublishReturn;
    try {
        response = await signedInCmd('publish', `Publishing ${edition.saveName.get()}`, saveData) as PublishReturn;
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
    const cacheTrickingScriptLink = `${script}?${(Date.now() % (31*24*60*60*1000)).toString(16)}`;

    await new AriaDialog<void>().baseOpen(
        null,
        'publishComplete', 
        [
            {t:'h1',txt:'Publish Complete'},
            {
                t:'div',
                css:['uploadCompleteGrid'],
                children:[
                    {t:'span',txt:'script:'},
                    {t:'a',a:{'href':cacheTrickingScriptLink,'target':'_blank'},txt:cacheTrickingScriptLink},
                    {t:'span',txt:'almanac:'},
                    {t:'a',a:{'href':almanac,'target':'_blank'},txt:almanac},
                ]
            }
        ],
        [{label:'OK'}]
    );

    return true;
}