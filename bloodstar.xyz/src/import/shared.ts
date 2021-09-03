/**
 * code for importing from Bloodstar saves
 * @module ImportShared
 */
import { showError } from '../dlg/blood-message-dlg';
import { chooseFile, OpenRequest, OpenResponse } from '../dlg/open-flow';
import {spinner} from '../dlg/spinner-dlg';
import { Edition } from "../model/edition";
import signIn, { signedInCmd } from '../sign-in';
import { ChooseCharactersDlg } from './choose-characters-dlg';
import { ScriptEntry } from './json';


/** dialog subclass for choosing an official character to clone */
class ChooseCharacterFromEditionDlg extends ChooseCharactersDlg {
    troubleBrewingSection!:HTMLElement;

    badMoonRisingSection!:HTMLElement;

    sectsAndVioletsSection!:HTMLElement;

    otherEditionsSection!:HTMLElement;

    /** bring up the dialog, return chosen characters */
    public static async open(edition:Edition):Promise<string[]> {
        const characters:ScriptEntry[] = [];
        characters.push({
            id:'_meta',
            name:edition.meta.name.get(),
            author:edition.meta.author.get(),
            logo:edition.meta.logo.get()||undefined
        });
        for (let i=0; i<edition.characterList.getLength(); ++i) {
            const character = edition.characterList.get(i);
            if (!character) {continue;}
            characters.push({
                id:character.id.get(),
                image:character.styledImage.get()||undefined,
                edition:character.id.get(),
                firstNightReminder:character.firstNightReminder.get(),
                otherNightReminder:character.otherNightReminder.get(),
                reminders:character.characterReminderTokens.get().split('\n'),
                remindersGlobal:character.globalReminderTokens.get().split('\n'),
                setup:character.setup.get(),
                name:character.name.get(),
                team:character.team.get(),
                ability:character.ability.get(),
            });
        }
        const choices = await new ChooseCharacterFromEditionDlg().open(characters);
        return choices.map(c=>c.id);
    }
}

/**
 * let the user choose and import a character from a Bloodstar save
 */
export default async function importShared(edition:Edition):Promise<boolean> {
    const file = await chooseFile({title:'Import', message:'Choose a file to import from', includeShared:true});
    if (!file) {return false;}
    const label = Array.isArray(file) ? file.join(' / ') : file;

    try {
        return await _importShared(edition, file)
    } catch (error) {
        await showError('Error', `Error encountered while trying to import ${label}`, error);
        return false;
    }
}

/** import character from chosen save */
async function _importShared(edition:Edition, file:string|[string, string]):Promise<boolean> {
    const sessionInfo = await signIn({
        title:'Sign In to Open',
        message:'You must first sign in to import.'
    });
    if (!sessionInfo){return false;}
    const label = Array.isArray(file) ? file.join(' / ') : file;
    const openData:OpenRequest = {
        saveName: file,
        token: sessionInfo.token,
        username: sessionInfo.username
    };

    // get the edition data
    const response = await signedInCmd<OpenResponse>('open', `Retrieving ${label}`, openData);
    if ('error' in response) {
        await showError('Error', `Error encountered while trying to open file ${label}`, response.error);
        return false;
    }

    // load into temp Edition
    const tempEdition = await Edition.asyncNew();
    if (!await spinner(
        'open',
        `Opening edition file "${label}"`,
        tempEdition.open(label, response.data)))
    {
        await showError('Error', `Error parsing "${label}"`);
        return false;
    }

    // choose characters
    const characters = await ChooseCharacterFromEditionDlg.open(tempEdition);

    // add chosen characters to Edition
    const promises:Promise<unknown>[] = [];
    characters.forEach(id=>{
        if (id === '_meta') {
            edition.forEachChild((childKey, observableObject)=>{
                observableObject.forEachProperty((propKey, property)=>{
                    promises.push(property.set(tempEdition.getChild(childKey).getPropertyValue(propKey)));
                });
                observableObject.forEachCollection(()=>{
                    throw new Error("Not yet implemented (_importShared collection case)");
                });
                observableObject.forEachChild(()=>{
                    throw new Error("Not yet implemented (_importShared child case)");
                });
            });
            return;
        }
        const character = tempEdition.getCharacterById(id);
        if (!character) {return;}
        const newId = edition.generateValidId(character.name.get());
        promises.push(character.id.set(newId));
        promises.push(edition.characterList.add(character));
    });
    await Promise.all(promises);
    return true;
}