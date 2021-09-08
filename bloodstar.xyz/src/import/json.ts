/**
 * import from json file to Bloodstar
 * @module ImportJson
 */

import { ObservableCollection } from "../bind/observable-collection";
import { ProcessImageSettings, urlToCanvas } from "../blood-image";
import {spinner} from '../dlg/spinner-dlg';
import { parseBloodTeam } from "../model/blood-team";
import { Character } from "../model/character";
import { Edition } from "../model/edition";
import * as StringDlg from '../dlg/blood-string-dlg';
import { fetchJson } from '../util';
import { AriaDialog } from "../dlg/aria-dlg";
import { ChooseCharactersDlg } from './choose-characters-dlg';

export type MetaEntry = {
    id:'_meta';
    name?:string;
    author?:string;
    logo?:string;
};
export type CharacterEntry = {
    id:string;
    image?:string;
    edition?:string;
    firstNight?:number;
    firstNightReminder?:string;
    otherNight?:number;
    otherNightReminder?:string;
    reminders?:string[];
    remindersGlobal?:string[];
    setup?:boolean;
    name?:string;
    team?:string;
    ability?:string;
};
export type ScriptEntry = CharacterEntry | MetaEntry;
type NightOrderTracker = Map<number, Character[]>;

// sizes here based on what what I see clocktower.online using
const MAX_LOGO_WIDTH = 1661;
const MAX_LOGO_HEIGHT = 709;

/** promise for choosing a JSON file */
async function chooseJsonFile():Promise<File|null> {
    const fileInput = document.getElementById('jsonFileInput');
    if (!(fileInput instanceof HTMLInputElement)) {return Promise.resolve(null);}
    fileInput.value = '';
    const dlg = new AriaDialog<File|null>();

    function chooseFile():void {
        if (fileInput instanceof HTMLInputElement) {
            fileInput.onchange=()=>{
                dlg.close(fileInput.files?.[0]);
            };
            fileInput.click();
        } else {
            dlg.close(null);
        }
    }

    return dlg.baseOpen(
        document.activeElement,
        'chooseJsonFile',
        [
            {t:'h1', txt:'Choose file'},
            {t:'div', css:['dialogBtnGroup'], children:[
                {t:'button', txt:'Choose File', events:{click:()=>{ chooseFile(); }}},
                {t:'button', txt:'Cancel', events:{click:()=>{ dlg.close(); }}}
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
        const canvas = await spinner(entry.id, 'Downloading edition logo', urlToCanvas(entry.logo, MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT));
        await spinner(entry.id, 'Setting edition logo', edition.meta.logo.set(canvas.toDataURL('image/png')));
    }
    return true;
}

/** import a character into the edition */
async function importCharacter(entry:CharacterEntry, edition:Edition, firstNightOrder:NightOrderTracker, otherNightOrder:NightOrderTracker):Promise<boolean> {
    const character = await spinner(entry.id, `Adding new character`, edition.addNewCharacter());
    const newId = edition.generateValidId(entry.name ?? 'newcharacter');
    await character.id.set(newId);

    const firstNightNumber = entry.firstNight ?? 0;
    const fnoList = firstNightOrder.get(firstNightNumber) ?? [];
    fnoList.push(character);
    firstNightOrder.set(firstNightNumber, fnoList);

    if (entry.firstNightReminder) {
        await character.firstNightReminder.set(entry.firstNightReminder);
    }

    const otherNightsNumber = entry.otherNight ?? 0;
    const onoList = otherNightOrder.get(otherNightsNumber) ?? [];
    onoList.push(character);
    otherNightOrder.set(otherNightsNumber, onoList);

    if (entry.otherNightReminder) {
        await character.otherNightReminder.set(entry.otherNightReminder);
    }
    if (entry.reminders) {
        await character.characterReminderTokens.set(entry.reminders.join('\n'));
    }
    if (entry.remindersGlobal) {
        await character.globalReminderTokens.set(entry.remindersGlobal.join('\n'));
    }
    if (entry.setup) {
        await character.setup.set(entry.setup);
    }
    if (entry.name) {
        await character.name.set(entry.name);
    }
    if (entry.team) {
        await character.team.set(parseBloodTeam(entry.team));
    }
    if (entry.ability) {
        await character.ability.set(entry.ability);
    }
    if (entry.image) {
        const canvas = await spinner(
            entry.id,
            `Downloading image for ${entry.name}`,
            urlToCanvas(entry.image, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT)
        );
        const dataUrl = canvas.toDataURL('image/png');
        await spinner(entry.id, `Setting character image for ${entry.name}`, character.imageSettings.shouldRestyle.set(false));
        await spinner(entry.id, `Setting character image for ${entry.name}`, character.unStyledImage.set(dataUrl));
    }

    return true;
}

/** import one entry of a script */
async function importEntry(entry:ScriptEntry, edition:Edition, firstNightOrder:NightOrderTracker, otherNightOrder:NightOrderTracker):Promise<boolean> {
    if (!entry.id) {
        return Promise.resolve(false);
    }
    if (entry.id === '_meta') {
        return spinner(entry.id, 'Importing _meta', importMeta(entry as MetaEntry, edition));
    }
    return spinner(entry.id, `Importing ${entry.name}`, importCharacter(entry as CharacterEntry, edition, firstNightOrder, otherNightOrder));
}

/** import a whole script */
async function importScript(json:ScriptEntry[], edition:Edition):Promise<boolean> {
    const choices = await new ChooseCharactersDlg().open(json);
    if (!choices.length) {return false;}

    const oldLength = edition.firstNightOrder.getLength();
    const firstNightOrder:NightOrderTracker = new Map<number, Character[]>();
    const otherNightOrder:NightOrderTracker = new Map<number, Character[]>();

    const promises = choices.map(async characterJson=>importEntry(characterJson, edition, firstNightOrder, otherNightOrder));

    const importResults = await spinner('importJsonFromUrl', 'Importing', Promise.all(promises));

    const allImported = importResults.reduce((a, b)=>a&&b, true);
    if (!allImported) { return false; }

    // set night order
    const data:[NightOrderTracker, ObservableCollection<Character>][] = [[firstNightOrder, edition.firstNightOrder], [otherNightOrder, edition.otherNightOrder]];
    for (const [nightMap, collection] of data) {
        let dst = oldLength;
        const keys = Array.from(nightMap.keys()).sort((a, b) => a - b);

        for (const key of keys) {
            for (const character of nightMap.get(key) ?? []) {
                const src = collection.indexOf(character);
                if (src > dst) {
                    await collection.move(src, dst++);
                }
            }
        }
    }

    return true;
}

/** import a json file, replacing the edition's current contents */
export async function importJson(fileOrStringOrArray:File | ScriptEntry[] | string, edition:Edition):Promise<boolean> {
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
    return importScript(json, edition);
}

/** user chose to import character(s) from a json file */
export async function importJsonFromFile(edition:Edition):Promise<boolean> {
    const file = await chooseJsonFile();
    if (!file) {return false;}
    return importJson(file, edition);
}

/** user chose to import character(s) from a json file */
export async function importJsonFromUrl(edition:Edition):Promise<boolean> {
    const url = await StringDlg.show('Enter URL', 'Enter URL to a custom-script.json file.');
    if (!url) {return false;}
    const json = await spinner('importJsonFromUrl', 'Fetching custom script JSON', fetchJson<ScriptEntry[]>(url));
    if (!json) {return false;}
    return importJson(json, edition);
}
