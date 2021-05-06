/**
 * import from json file to Bloodstar
 * @module ImportJson
 */

import { imageUrlToDataUri } from "../blood-image";
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

/** import meta information about the edition */
async function importMeta(entry:MetaEntry, edition:Edition):Promise<boolean> {
    if (entry.name) {
        edition.meta.name.set(entry.name);
    }
    if (entry.author) {
        edition.meta.author.set(entry.author);
    }
    if (entry.logo) {
        const dataUri = await imageUrlToDataUri(entry.logo, true);
        // TODO: limit size
        edition.meta.logo.set(dataUri);
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
        const dataUri = await imageUrlToDataUri(entry.image, true);
        character.imageSettings.shouldRestyle.set(false);
        if (dataUri) {
            character.unStyledImage.set(dataUri);
        }
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
    const promises = json.map(async characterJson=>await importEntry(characterJson, edition, nightOrder));
    for (const characterJson of json) {
        promises.push
        if (!await importEntry(characterJson, edition, nightOrder)) {
            return false;
        }
    }
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
    // TODO: I have some kind of bug causing everything to get added twice!
    return await importEdition(json, edition);
}