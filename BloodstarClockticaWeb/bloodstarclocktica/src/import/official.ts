/**
 * code for importing official characters
 * @module ImportOfficial
 */

import { AriaDialog } from "../dlg/aria-dlg";
import {spinner} from '../dlg/spinner-dlg';
import { Edition } from "../model/edition";
import { createElement, fetchJson } from "../util";
import { CharacterEntry } from "./json";
import { urlToCanvas } from "../blood-image";
import { parseBloodTeam } from "../model/blood-team";
import { setTeamColorStyle } from "../team-color";
import { Character } from "../model/character";

const MAX_CHARACTER_ICON_WIDTH = 539;
const MAX_CHARACTER_ICON_HEIGHT = 539;

/** dialog subclass for choosing an official character to clone */
class ChooseOfficialCharDlg extends AriaDialog<CharacterEntry> {
    async open(json:CharacterEntry[]):Promise<CharacterEntry|null> {
        const entriesById = toMap(json);
        const troubleBrewing = createElement({t:'details',children:[{t:'summary',txt:'Trouble Brewing'}],a:{open:''}});
        const badMoonRising = createElement({t:'details',children:[{t:'summary',txt:'Bad Moon Rising'}],a:{open:''}});
        const sectsAndViolets = createElement({t:'details',children:[{t:'summary',txt:'Sects and Violets'}],a:{open:''}});
        const otherEditions = createElement({t:'details',children:[{t:'summary',txt:'Other'}],a:{open:''}});
        const container = createElement({t:'div',css:['importOfficialList'],children:[troubleBrewing, badMoonRising, sectsAndViolets, otherEditions]});
        const onFilterChange=(e:Event)=>{
            if (e.target instanceof HTMLInputElement) {
                const filterString = e.target.value;
                for (const section of [troubleBrewing, badMoonRising, sectsAndViolets, otherEditions]) {
                    doFilter(filterString, entriesById, section);
                }
            }
        };
        const filterRow = createElement({
            t:'div',
            css:['row'],
            children:[
                {t:'label',a:{'for':'chooseOfficialFilter'},txt:'Filter'},
                {
                    t:'input',id:'chooseOfficialFilter',a:{name:'chooseOfficialFilter'},
                    events:{change:onFilterChange,input:onFilterChange}
                }
            ]});

        for (const character of json) {
            if (!character.name) {continue;}
            const button = createElement({
                t:'button',
                txt:character.name,
                events:{click:()=>this.close(character)},
                a:{title:character.ability||'','data-id':character.id}
            });
            setTeamColorStyle(parseBloodTeam(character.team || ''), button.classList);
            switch (character.edition) {
                case 'tb': troubleBrewing.appendChild(button); break;
                case 'bmr': badMoonRising.appendChild(button); break;
                case 'snv': sectsAndViolets.appendChild(button); break;
                default: otherEditions.appendChild(button); break;
            }
        }
        return await this.baseOpen(
            document.activeElement,
            'importOfficial',
            [
                {t:'p',txt:'Choose a character to import:'},
                filterRow,
                container
            ],
            [{label:'Cancel'}]
        );
    }
}

/**
 * hide characters who don't pass the filter
 */
function doFilter(filterString:string, characters:Map<string, CharacterEntry>, parentElement:Element):void {
    const childElements = parentElement.children;
    const numChildren = childElements.length;
    for (let i=0; i<numChildren; ++i) {
        const child = childElements[i];
        if (!(child instanceof HTMLElement)) {continue;}
        const id = child.dataset.id;
        if (!id) {continue;}
        const character = characters.get(id);
        if (!character) {continue;}
        if (passesFilter(filterString, character)) {
            child.classList.remove('hidden');
        } else {
            child.classList.add('hidden');
        }
    }
}

/**
 * let the user choose and import an official character
 */
export default async function importOfficial(edition:Edition):Promise<boolean> {
    const json = await fetchJson<CharacterEntry[]>('https://raw.githubusercontent.com/bra1n/townsquare/main/src/roles.json');
    if (!json) {return false;}
    const choice = await new ChooseOfficialCharDlg().open(json);
    if (!choice) {return false;}
    
    const character = await edition.addNewCharacter();
    try {
        return await _importOfficial(choice, character);
    } catch (error) {
        await edition.characterList.deleteItem(character);
        throw error;
    }
}

/** load from the character entry to the character object */
async function _importOfficial(fromCharacter:CharacterEntry, toCharacter:Character):Promise<boolean> {
    if (fromCharacter.ability) {
        await toCharacter.ability.set(fromCharacter.ability);
    }
    if (fromCharacter.firstNightReminder) {
        await toCharacter.firstNightReminder.set(fromCharacter.firstNightReminder);
    }
    if (fromCharacter.id) {
        await toCharacter.id.set(fromCharacter.id);
    }
    {
        const url = `https://github.com/bra1n/townsquare/raw/main/src/assets/icons/${fromCharacter.id}.png`;
        const canvas = await spinner(fromCharacter.id, `Downloading image for ${fromCharacter.name}`, urlToCanvas(url, MAX_CHARACTER_ICON_WIDTH, MAX_CHARACTER_ICON_HEIGHT, true));
        const dataUrl = canvas.toDataURL('image/png');
        await toCharacter.imageSettings.shouldRestyle.set(false);
        await spinner(fromCharacter.id, `Setting character image for ${fromCharacter.name}`, toCharacter.unStyledImage.set(dataUrl));
    }
    if (fromCharacter.name) {
        await toCharacter.name.set(fromCharacter.name);
    }
    if (fromCharacter.otherNightReminder) {
        await toCharacter.otherNightReminder.set(fromCharacter.otherNightReminder);
    }
    if (fromCharacter.reminders) {
        await toCharacter.characterReminderTokens.set(fromCharacter.reminders.join('\n'));
    }
    if (fromCharacter.remindersGlobal) {
        await toCharacter.globalReminderTokens.set(fromCharacter.remindersGlobal.join('\n'));
    }
    if (fromCharacter.setup) {
        await toCharacter.setup.set(fromCharacter.setup);
    }
    if (fromCharacter.team) {
        await toCharacter.team.set(parseBloodTeam(fromCharacter.team));
    }
    return true;
}

/** test a character against the filter */
function passesFilter(filterString:string, entry:CharacterEntry):boolean {
    if (!filterString) {return true;}
    filterString = filterString.toLowerCase();
    for (const haystack of Object.values(entry)){
        if (typeof haystack === 'string') {
            if (-1 !== haystack.toLowerCase().indexOf(filterString)) {return true;}
        }
    }
    return false;
}

/** convert list of entries to map by id */
function toMap(entries:CharacterEntry[]):Map<string, CharacterEntry> {
    const map = new Map<string, CharacterEntry>();
    for (const entry of entries){
        map.set(entry.id, entry);
    }
    return map;
}