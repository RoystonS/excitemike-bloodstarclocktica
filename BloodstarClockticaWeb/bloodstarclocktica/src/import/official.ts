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

const MAX_CHARACTER_ICON_WIDTH = 539;
const MAX_CHARACTER_ICON_HEIGHT = 539;

class ChooseOfficialCharDlg extends AriaDialog<CharacterEntry> {
    async open(json:CharacterEntry[]):Promise<CharacterEntry|null> {
        const characterListDiv = createElement({t:'div',css:['importOfficialList']});
        for (const character of json) {
            if (!character.name) {continue;}
            const button = createElement({
                t:'button',
                txt:character.name,
                events:{click:()=>this.close(character)},
                a:{title:character.ability||''}
            });
            characterListDiv.appendChild(button);
        }
        return await this.baseOpen(
            document.activeElement,
            'importOfficial',
            [
                {t:'p',txt:'Choose a character to import:'},
                characterListDiv
            ],
            [{label:'Cancel'}]
        );
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
    if (choice.ability) {
        await character.ability.set(choice.ability);
    }
    if (choice.firstNightReminder) {
        await character.firstNightReminder.set(choice.firstNightReminder);
    }
    if (choice.id) {
        await character.id.set(choice.id);
    }
    {
        const url = `https://github.com/bra1n/townsquare/raw/main/src/assets/icons/${choice.id}.png`;
        const canvas = await spinner(choice.id, `Downloading image for ${choice.name}`, urlToCanvas(url, MAX_CHARACTER_ICON_WIDTH, MAX_CHARACTER_ICON_HEIGHT, true));
        const dataUrl = canvas.toDataURL('image/png');
        await character.imageSettings.shouldRestyle.set(false);
        await spinner(choice.id, `Setting character image for ${choice.name}`, character.unStyledImage.set(dataUrl));
    }
    if (choice.name) {
        await character.name.set(choice.name);
    }
    if (choice.otherNightReminder) {
        await character.otherNightReminder.set(choice.otherNightReminder);
    }
    if (choice.reminders) {
        await character.characterReminderTokens.set(choice.reminders.join('\n'));
    }
    if (choice.remindersGlobal) {
        await character.globalReminderTokens.set(choice.remindersGlobal.join('\n'));
    }
    if (choice.setup) {
        await character.setup.set(choice.setup);
    }
    if (choice.team) {
        await character.team.set(parseBloodTeam(choice.team));
    }
    return true;
}
