/**
 * import from json file to Bloodstar
 * @module ImportJson
 */

import { urlToCanvas } from "../blood-image";
import { parseBloodTeam } from "../model/blood-team";
import { Edition } from "../model/edition";

type MetaEntry = {
    id:'_meta',
    name?:string,
    author?:string,
    logo?:string
};
type CharacterEntry = {
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
type ScriptEntry = MetaEntry|CharacterEntry;
type NightOrderTracker = Map<'first'|'other', Map<number, string[]>>;

// sizes here based on what what I see clocktower.online using
const MAX_LOGO_WIDTH = 1661;
const MAX_LOGO_HEIGHT = 709;
const MAX_CHARACTER_ICON_WIDTH = 539;
const MAX_CHARACTER_ICON_HEIGHT = 539;

/** import meta information about the edition */
async function importMeta(entry:MetaEntry, edition:Edition):Promise<boolean> {
    if (entry.name) {
        edition.meta.name.set(entry.name);
    }
    if (entry.author) {
        edition.meta.author.set(entry.author);
    }
    if (entry.logo) {
        const canvas = await urlToCanvas(entry.logo, MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT, true);
        edition.meta.logo.set(canvas.toDataURL('image/png'));
    }
    return true;
}

/** import a character into the edition */
async function importCharacter(entry:CharacterEntry, edition:Edition, nightOrder:NightOrderTracker):Promise<boolean> {
    const character = edition.addNewCharacter();
    character.id.set(entry.id);
    {
        const fno = nightOrder.get('first') || new Map<number, string[]>();
        const fnoList = (entry.firstNight!==undefined) && fno.get(entry.firstNight) || [];
        fnoList.push(entry.id);
        fno.set(entry.firstNight || 0, fnoList);
        nightOrder.set('first', fno);
    }
    if (entry.firstNightReminder){
        character.firstNightReminder.set(entry.firstNightReminder);
    }
    {
        const ono = nightOrder.get('other') || new Map<number, string[]>();
        const onoList = (entry.otherNight!==undefined) && ono.get(entry.otherNight) || [];
        onoList.push(entry.id);
        ono.set(entry.otherNight || 0, onoList);
        nightOrder.set('other', ono);
    }
    if (entry.otherNightReminder){
        character.otherNightReminder.set(entry.otherNightReminder);
    }
    if (entry.reminders){
        character.characterReminderTokens.set(entry.reminders.join('\n'));
    }
    if (entry.remindersGlobal){
        character.globalReminderTokens.set(entry.remindersGlobal.join('\n'));
    }
    if (entry.setup){
        character.setup.set(entry.setup);
    }
    if (entry.name){
        character.name.set(entry.name);
    }
    if (entry.team){
        character.team.set(parseBloodTeam(entry.team));
    }
    if (entry.ability){
        character.ability.set(entry.ability);
    }
    if (entry.image){
        const canvas = await urlToCanvas(entry.image, MAX_CHARACTER_ICON_WIDTH, MAX_CHARACTER_ICON_HEIGHT, true);
        const dataUrl = canvas.toDataURL('image/png');
        character.imageSettings.shouldRestyle.set(false);
        character.unStyledImage.set(dataUrl);
    }

    return true;
}

/** import one entry of a script */
async function importEntry(entry:ScriptEntry, edition:Edition, nightOrder:NightOrderTracker):Promise<boolean> {
    if (!entry.id) {
        return false;
    }
    if (entry.id === '_meta') {
        return await importMeta(entry as MetaEntry, edition);
    }
    return await importCharacter(entry as CharacterEntry, edition, nightOrder);
}

/** import a whole script */
async function importEdition(json:ScriptEntry[], edition:Edition):Promise<boolean> {
    edition.reset();
    edition.characterList.clear();
    const nightOrder:NightOrderTracker = new Map<'first'|'other', Map<number, string[]>>();
    const promises = json.map(characterJson=>importEntry(characterJson, edition, nightOrder));
    return (await Promise.all(promises)).reduce((a,b)=>a&&b, true);
}

/** import a json file, replacing the edition's current contents */
export async function importJson(fileOrStringOrArray:File|string|any[], edition:Edition):Promise<boolean> {
    let json:ScriptEntry[];
    if (fileOrStringOrArray instanceof File) {
        const text = await fileOrStringOrArray.text();
        json = JSON.parse(text);
    } else if (typeof fileOrStringOrArray === 'string') {
        const parseResult = JSON.parse(fileOrStringOrArray);
        if (!Array.isArray(parseResult)) { return false; }
        json = parseResult;
    } else {
        json = fileOrStringOrArray;
    }
    return await importEdition(json, edition);
}