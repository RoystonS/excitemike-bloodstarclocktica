/**
 * import from json file to Bloodstar
 * @module ImportJson
 */

 import {savePromptIfDirty} from '../dlg/blood-save-discard-cancel';
import { ObservableCollection } from "../bind/observable-collection";
import { urlToCanvas } from "../blood-image";
import {spinner} from '../dlg/spinner-dlg';
import { parseBloodTeam } from "../model/blood-team";
import { Character } from "../model/character";
import { Edition } from "../model/edition";
import * as StringDlg from '../dlg/blood-string-dlg';
import { fetchJson } from '../util';
import { AriaDialog } from "../dlg/aria-dlg";

export type MetaEntry = {
    id:'_meta',
    name?:string,
    author?:string,
    logo?:string
};
export type CharacterEntry = {
    id:string,
    image?:string,
    edition?:string,
    firstNight?:number,
    firstNightReminder?:string,
    otherNight?:number,
    otherNightReminder?:string,
    reminders?:string[],
    remindersGlobal?:string[],
    setup?:boolean,
    name?:string,
    team?:string,
    ability?:string,
};
export type ScriptEntry = MetaEntry|CharacterEntry;
type NightOrderTracker = Map<number, Character[]>;

// sizes here based on what what I see clocktower.online using
const MAX_LOGO_WIDTH = 1661;
const MAX_LOGO_HEIGHT = 709;
const MAX_CHARACTER_ICON_WIDTH = 539;
const MAX_CHARACTER_ICON_HEIGHT = 539;

/** promise for choosing a JSON file */
async function chooseJsonFile():Promise<File|null> {
    const fileInput = document.getElementById('jsonFileInput');
    if (!(fileInput instanceof HTMLInputElement)) {return null;}
    fileInput.value = '';
    const dlg = new AriaDialog<File|null>();

    function chooseFile():void {
        if (fileInput instanceof HTMLInputElement) {
            fileInput.onchange=()=>{
                dlg.close(fileInput.files && fileInput.files[0]);
            };
            fileInput.click();
        } else {
            dlg.close(null)
        }
    }
    
    return await dlg.baseOpen(
        document.activeElement,
        'chooseJsonFile',
        [
            {t:'h1',txt:'Choose file'},
            {t:'div',css:['dialogBtnGroup'],children:[
                {t:'button',txt:'Choose File',events:{click:()=>chooseFile()}},
                {t:'button',txt:'Cancel',events:{click:()=>dlg.close()}}
            ]}
        ],
        []
    );
}

/** import meta information about the edition */
async function importMeta(entry:MetaEntry, edition:Edition):Promise<boolean> {
    if (entry.name) {
        await edition.meta.name.set(entry.name);
    }
    if (entry.author) {
        await edition.meta.author.set(entry.author);
    }
    if (entry.logo) {
        const canvas = await spinner(entry.id, 'Downloading edition logo', urlToCanvas(entry.logo, MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT, true));
        await spinner(entry.id, 'Setting edition logo', edition.meta.logo.set(canvas.toDataURL('image/png')));
    }
    return true;
}

/** import a character into the edition */
async function importCharacter(entry:CharacterEntry, edition:Edition, firstNightOrder:NightOrderTracker, otherNightOrder:NightOrderTracker):Promise<boolean> {
    const character = await spinner(entry.id, `Adding new character`, edition.addNewCharacter());
    await character.id.set(entry.id);
    {
        const nightNumber = entry.firstNight || 0;
        const fnoList = firstNightOrder.get(nightNumber) || [];
        fnoList.push(character);
        firstNightOrder.set(nightNumber, fnoList);
    }
    if (entry.firstNightReminder){
        await character.firstNightReminder.set(entry.firstNightReminder);
    }
    {
        const nightNumber = entry.otherNight || 0;
        const onoList = otherNightOrder.get(nightNumber) || [];
        onoList.push(character);
        otherNightOrder.set(nightNumber, onoList);
    }
    if (entry.otherNightReminder){
        await character.otherNightReminder.set(entry.otherNightReminder);
    }
    if (entry.reminders){
        await character.characterReminderTokens.set(entry.reminders.join('\n'));
    }
    if (entry.remindersGlobal){
        await character.globalReminderTokens.set(entry.remindersGlobal.join('\n'));
    }
    if (entry.setup){
        await character.setup.set(entry.setup);
    }
    if (entry.name){
        await character.name.set(entry.name);
    }
    if (entry.team){
        await character.team.set(parseBloodTeam(entry.team));
    }
    if (entry.ability){
        await character.ability.set(entry.ability);
    }
    if (entry.image){
        const canvas = await spinner(entry.id, `Downloading image for ${entry.name}`, urlToCanvas(entry.image, MAX_CHARACTER_ICON_WIDTH, MAX_CHARACTER_ICON_HEIGHT, true));
        const dataUrl = canvas.toDataURL('image/png');
        await spinner(entry.id, `Setting character image for ${entry.name}`, character.imageSettings.shouldRestyle.set(false));
        await spinner(entry.id, `Setting character image for ${entry.name}`, character.unStyledImage.set(dataUrl));
    }

    return true;
}

/** import one entry of a script */
async function importEntry(entry:ScriptEntry, edition:Edition, firstNightOrder:NightOrderTracker, otherNightOrder:NightOrderTracker):Promise<boolean> {
    if (!entry.id) {
        return false;
    }
    if (entry.id === '_meta') {
        return await spinner(entry.id, 'Importing _meta', importMeta(entry as MetaEntry, edition));
    }
    return await spinner(entry.id,`Importing ${entry.name}`, importCharacter(entry as CharacterEntry, edition, firstNightOrder, otherNightOrder));
}

/** import a whole script */
async function importEdition(json:ScriptEntry[], edition:Edition):Promise<boolean> {
    await edition.reset();
    await edition.characterList.clear();
    const firstNightOrder:NightOrderTracker = new Map<number, Character[]>();
    const otherNightOrder:NightOrderTracker = new Map<number, Character[]>();
    const promises = json.map(characterJson=>importEntry(characterJson, edition, firstNightOrder, otherNightOrder));

    const allImported = (await Promise.all(promises)).reduce((a,b)=>a&&b, true);
    if (!allImported) { return false; }

    // set night order
    const data:[NightOrderTracker, ObservableCollection<Character>][] = [[firstNightOrder, edition.firstNightOrder],[otherNightOrder, edition.otherNightOrder]];
    for (const [nightMap, collection] of data) {
        const keys = Array.from(nightMap.keys()).sort((a, b) => a - b);
        await collection.clear();
        for (const key of keys) {
            await collection.addMany(nightMap.get(key) || []);
        }
    }

    return true;
}

/** import a json file, replacing the edition's current contents */
export async function importJson(fileOrStringOrArray:File|string|ScriptEntry[], edition:Edition):Promise<boolean> {
    let json:ScriptEntry[];
    if (fileOrStringOrArray instanceof File) {
        const text = await spinner('importJson', 'Retrieving response text', fileOrStringOrArray.text());
        json = JSON.parse(text);
    } else if (typeof fileOrStringOrArray === 'string') {
        const parseResult = JSON.parse(fileOrStringOrArray);
        if (!Array.isArray(parseResult)) { return false; }
        json = parseResult;
    } else {
        json = fileOrStringOrArray;
    }
    return await spinner('importJson', 'Importing edition', importEdition(json, edition));
}

/** user chose to import character(s) from a json file */
export async function importJsonFromFile(edition:Edition):Promise<boolean> {
    if (!await savePromptIfDirty(edition)) {return false;}
    const file = await chooseJsonFile();
    if (!file){return false;}
    return await importJson(file, edition);
}

/** user chose to import character(s) from a json file */
export async function importJsonFromUrl(edition:Edition):Promise<boolean> {
    if (!await savePromptIfDirty(edition)) {return false;}
    const url = await StringDlg.show('Enter URL', 'Enter URL to a custom-script.json file.');
    if (!url){return false;}
    const json = await fetchJson<ScriptEntry[]>(url);
    if (!json) {return false;}
    return await spinner('importJsonFromUrl', 'Importing json', importJson(json, edition)) || false;
}