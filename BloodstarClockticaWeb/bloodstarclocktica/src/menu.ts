/**
 * Code related to menu commands
 * @module Menu
 */

import { show as showMessage, showError } from "./dlg/blood-message-dlg";
import { Edition } from "./model/edition";
import { hookupClickEvents } from "./util";
import importOfficial from './import/official';
import publish from './commands/publish';
import {save, saveAs} from './commands/save';
import {chooseAndDeleteFile} from './commands/delete';
import * as SdcDlg from './dlg/blood-save-discard-cancel';
import {signIn, signOut, UserInfo} from './sign-in';
import { clearRecentFile, setRecentFile } from "./recent-file";
import { show as showOpenFlow } from "./dlg/open-flow";
import * as BloodIO from './blood-io';

/** add a new character to the custom edition */
async function addCharacterClicked(edition:Edition):Promise<boolean> {
    await edition.addNewCharacter();
    return true;
}

/** user chose to change their password */
async function changePasswordClicked(_edition:Edition):Promise<boolean> {
    // TODO: implement changePasswordClicked
    await showMessage('Not implemented', 'This feature is not yet implemented');
    return true;
}

/** user chose to delete their account */
async function deleteAccountClicked(_edition:Edition):Promise<boolean> {
    // TODO: implement deleteAccountClicked
    await showMessage('Not implemented', 'This feature is not yet implemented');
    return true;
}

/** menu item for delete clicked */
export async function deleteFileClicked(edition:Edition):Promise<boolean> {
    const deleted = await chooseAndDeleteFile();
    if (!deleted) {return false;}
    clearRecentFile(deleted);

    // if you deleted the current edition, you must mark all its images as dirty!
    if (deleted === edition.saveName.get()) {
        await edition.markDirty();
    }

    return true;
}

/** user chose to import official character(s) */
async function importOfficialClicked(edition:Edition):Promise<boolean> {
    try {
        return await importOfficial(edition);
    } catch (error) {
        await showError('Error', 'Something went wrong when trying to clone official character', error);
        throw error;
    }
}

/** hook up menu commands to html elements */
export default function init(edition:Edition):void {
    // TODO: might be easier to maintain if I built the html in code?
    const mapping:[string,(edition:Edition)=>Promise<boolean>][] = [
        ['signOutBtn', signOutClicked],
        ['changePasswordBtn', changePasswordClicked],
        ['deleteAccountBtn', deleteAccountClicked],
        ['addCharacterButton', addCharacterClicked],
        ['newFileButton', newFileClicked],
        ['openFileButton', showOpenFlow],
        ['deleteFileButton', deleteFileClicked],
        ['saveFileButton', save],
        ['saveFileAsButton', saveFileAsClicked],
        ['jsonFromUrlButton', BloodIO.importJsonFromUrl],
        ['jsonFromFileButton', BloodIO.importJsonFromFile],
        ['importBlood', BloodIO.importBlood],
        ['importOfficialButton', importOfficialClicked],
        ['saveAndPublishButton', saveAndPublishClicked],
        ['helpButton', showHelp],
    ];
    const translatedMapping:[string,(e:Event)=>void][] = mapping.map(x=>{
        const [name,f] = x;
        return [name, ()=>void f(edition)];
    });
    hookupClickEvents(translatedMapping);
}

/**
 * user chose to open a new file
 */
async function newFileClicked(edition:Edition):Promise<boolean> {
    try {
        await BloodIO.newEdition(edition);
    } catch (error) {
        await showError('Error', 'Something went wrong when creating new file', error);
    }
    return true;
}

/** user chose to save and publish */
async function saveAndPublishClicked(edition:Edition):Promise<boolean> {
    if (!edition.dirty.get() || await save(edition)) {
        await publish(edition);
    }
    return false;
}

/**
 * user chose to save the current file under a new name
 */
export async function saveFileAsClicked(edition:Edition):Promise<boolean> {
    if (await saveAs(edition)) {
        setRecentFile(edition.saveName.get());
        return true;
    }
    return false;
}

/** clicked the help menu button */
function showHelp(_edition:Edition):Promise<boolean> {
    // TODO: implement showHelp
    void showError('Not yet implemented', '`showHelp` Not yet implemented');
    return Promise.resolve(true);
}

/** forget session info */
async function signOutClicked(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    signOut();
    updateUserDisplay(null);
    const session = await signIn();
    updateUserDisplay(session);
    return true;
}

/** show who is signed in and a sign out button */
export function updateUserDisplay(session:UserInfo|null):void {
    const username = document.getElementById('userName');
    if (!(username instanceof HTMLSpanElement)){return;}
    username.innerText = session ? session.username : '';
}