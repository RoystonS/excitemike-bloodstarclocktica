/**
 * Create script.json
 * @module Publish
 */
import {Edition} from '../model/edition';
import { AriaDialog } from '../dlg/aria-dlg';
import genericCmd from './generic-cmd';

type PublishRequest = {
    saveName:string;
    token:string;
};
type PublishResponse = {success:true; script:string; almanac:string};

/* eslint-disable max-len */
const donateHtml = `<form action="https://www.paypal.com/donate" method="post" target="_top">
<input type="hidden" name="business" value="XETJMX9JKLGKQ" />
<input type="hidden" name="no_recurring" value="0" />
<input type="hidden" name="item_name" value="I shared Bloodstar for BotC fans to use for free, but any help with the costs for storing all those images is appreciated!" />
<input type="hidden" name="currency_code" value="USD" />
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
</form>
`;
/* eslint-enable max-len */

/**
 * publish the edition
 */
export default async function publish(edition:Edition):Promise<boolean> {
    const saveName = edition.saveName.get();
    const result = await genericCmd<PublishRequest, PublishResponse>({
        command:'publish',
        errorMessage:'Error encountered during publish',
        request:sessionInfo=>({
            token:sessionInfo?.token??'',
            saveName: saveName
        }),
        signIn:{title:'Sign In to Publish', message:'You must be signed in to publish.'},
        spinnerMessage:`Publishing ${edition.saveName.get()}`
    });

    if ('error' in result) {return false;}
    if ('cancel' in result) {return false;}
    const {script, almanac} = result.data;
    const cacheTrickingScriptLink = `${script}?${(Date.now() % (31*24*60*60*1000)).toString(16)}`;

    const copyLink = async (evt: Event, link:string)=>{
        try {
            await navigator.clipboard.writeText(link);
            if (evt.target instanceof HTMLButtonElement) {
                evt.target.innerText = 'Copied!';
            }
        } catch (e: unknown) {
            // do nothing
        }
    };
    const copyScriptLink = async (evt: Event)=>copyLink(evt, cacheTrickingScriptLink);
    const copyAlmanacLink = async (evt: Event)=>copyLink(evt, almanac);

    await new AriaDialog<void>().baseOpen(
        null,
        'publishComplete',
        [
            {t:'h1', txt:'Publish Complete'},
            {
                t:'div',
                css:['uploadCompleteGrid'],
                children:[
                    {t:'span', txt:'script:'},
                    {t:'a', a:{href:cacheTrickingScriptLink, target:'_blank'}, txt:cacheTrickingScriptLink},
                    {t:'button', txt:'copy', events:{click:copyScriptLink}},
                    {t:'span', txt:'almanac:'},
                    {t:'a', a:{href:almanac, target:'_blank'}, txt:almanac},
                    {t:'button', txt:'copy', events:{click:copyAlmanacLink}},
                    {t:'div'},
                    {t:'span', txt:'Help cover hosting costs: '},
                    {t:'div', html: donateHtml}
                ]
            }
        ],
        [{label:'OK'}]
    );

    return true;
}