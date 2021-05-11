/**
 * code related to save commands
 * @module Save
 */
import cmd from './cmd';
import {show as inputDlg} from '../dlg/blood-string-dlg';
import { Edition } from '../model/edition';
import { showError } from '../dlg/blood-message-dlg';
import Locks from '../lock';
import {spinner} from '../dlg/spinner-dlg';

type SaveReturn = {error?:string};

const MAX_SIMULTANEOUS_IMAGE_UPLOADS = 5;

/**
 * prompt for a name, then save with that name
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
 export async function saveAs(username:string, password:string, edition:Edition):Promise<boolean> {
    const name = await promptForName(edition.saveName.get());
    if (!name) {
        return Promise.resolve(false);
    }
    const backupName = edition.saveName.get();
    try {
        await edition.saveName.set(name);
        return !!(await _save(username, password, edition));
    } catch (error) {
        await edition.saveName.set(backupName);
        showError('Error', 'Error encountered while trying to save', error);
    }
    return false;
}

/**
 * show loading dialog while saving
 * @param username login credentials
 * @param password login credentials
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function save(username:string, password:string, edition:Edition):Promise<boolean> {
    const saveName = edition.saveName.get();
    switch (saveName) {
        case '':
            return await saveAs(username, password, edition);
        default:
            return await _save(username, password, edition);
    }
}


type Separated = {
    edition:unknown,
    sourceImages:Map<string,string>,
    finalImages:Map<string,string>
};

/** separate the edition json and images for saving as separate files */
function separateImages(edition:Edition):Separated {
    const saveName = edition.saveName.get();
    const editionSerialized = edition.serialize();
    const characters = editionSerialized.characterList as {id:string, unStyledImage?:string, styledImage?:string}[];
    const sourceImages = new Map<string, string>();
    const finalImages = new Map<string, string>();
    for (const character of characters) {
        const id = character.id;
        if (!id) {continue;}
        {
            const oldImageStr = character.unStyledImage;
            if (oldImageStr && oldImageStr.startsWith('data:')) {
                character.unStyledImage = `https://www.bloodstar.xyz/save/${saveName}/${id}.src.png`;
                sourceImages.set(id, oldImageStr);
            }
        }
        {
            const oldImageStr = character.styledImage;
            if (oldImageStr && oldImageStr.startsWith('data:')) {
                character.styledImage = `https://www.bloodstar.xyz/save/${saveName}/${id}.png`;
                finalImages.set(id, oldImageStr);
            }
        }
    }
    return {
        edition:editionSerialized,
        sourceImages,
        finalImages
    };
}

/**
 * Save the file under the name saved in it
 * Brings up the loading spinner during the operation
 * @param username login credentials
 * @param password login credentials
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
async function _save(username:string, password:string, edition:Edition):Promise<boolean> {
    type SaveData = {
        saveName:string,
        edition?:unknown,
        id?:string,
        isSource?:boolean
        image?:string
    };
    
    // serialize the edition, but break images out into separate pieces to save
    const toSave = separateImages(edition);
    const promises = [];

    // save JSON
    const saveName = edition.saveName.get();
    {
        const saveData:SaveData = {
            saveName: saveName,
            edition: toSave.edition
        };
        const payload = JSON.stringify(saveData);
        promises.push(cmd(username, password, 'save', `Saving edition data`, payload));
    }

    for (const [id,imageString] of toSave.sourceImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.dirtySourceImages.has(id)) {continue;}
        promises.push(Locks.enqueue('saveImage', ()=>{
            const saveData:SaveData = {
                saveName: saveName,
                id: id,
                isSource:true,
                image: imageString
            };
            const payload = JSON.stringify(saveData);
            return cmd(username, password, 'save-img', `Saving ${id}.src.png`, payload);
        }, MAX_SIMULTANEOUS_IMAGE_UPLOADS));
    }

    for (const [id,imageString] of toSave.finalImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.dirtyFinalImages.has(id)) {continue;}
        promises.push(Locks.enqueue('saveImage', ()=>{
            const saveData:SaveData = {
                saveName: saveName,
                id: id,
                isSource:false,
                image: imageString
            };
            const payload = JSON.stringify(saveData);
            return cmd(username, password, 'save-img', `Saving ${id}.png`, payload);
        }, MAX_SIMULTANEOUS_IMAGE_UPLOADS));
    }

    // await results
    const results = await spinner('save', `Saving as ${saveName}`, Promise.all(promises)) as SaveReturn[];
    for (const {error} of results) {
        if (error) {
            showError('Error', 'Error encountered while trying to save', error);
            return false;
        }
    }

    // mark things as up to date
    edition.dirtySourceImages.clear();
    edition.dirtyFinalImages.clear();
    await edition.dirty.set(false);
    
    return true;
}

/**
 * prompt the user to enter a name to save as
 */
async function promptForName(defaultName:string):Promise<string|null> {
    return await inputDlg(
        'Enter name to save as. (lowercase with no spaces or special characters)',
        defaultName,
        {
            pattern:'[-a-z0-9.]{1,25}',
            hint: 'lowercase with no spaces or special characters',
            sanitizeFn: sanitizeSaveName
        });
}

/**
 * sanitize a save name
 */
function sanitizeSaveName(original:string):string {
    const re = /^[-a-z0-9.]{1,25}$/;
    if (re.test(original)) {
        return original;
    }
    let corrected = '';
    for (const char of original) {
        if (re.test(char) && corrected.length < 25) {
            corrected += char;
        }
    }
    return corrected;
}