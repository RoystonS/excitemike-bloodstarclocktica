/**
 * code related to save commands
 * @module Save
 */
import cmd from './cmd';
import {show as inputDlg} from '../dlg/blood-string-dlg';
import { Edition } from '../model/edition';
import { show as showMessage, showError } from '../dlg/blood-message-dlg';
import Locks from '../lock';
import {spinner} from '../dlg/spinner-dlg';
import { AriaDialog } from '../dlg/aria-dlg';
import { setRecentFile } from '../recent-file';
import { updateSaveNameWarnings, validateSaveName } from '../validate';
import signIn from '../sign-in';

type SaveReturn = {error?:string};

const MAX_SIMULTANEOUS_IMAGE_SAVES = 8;

/**
 * prompt for a name, then save with that name
 * Brings up the loading spinner during the operation
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
 export async function saveAs(edition:Edition):Promise<boolean> {
    const name = await promptForName(edition.saveName.get());
    const authToken = (await signIn()).token;

    // null means cancel
    if (null === name) {return false;}
    
    if (!validateSaveName(name)) {
        await showMessage('Invalid File Name', `"${name}" is not a valid filename.`);
        return false;
    }

    const backupName = edition.saveName.get();
    try {
        await edition.saveName.set(name);
        const success = await _save(authToken, edition, backupName===name);
        if (!success) {
            await edition.saveName.set(backupName);
        }
        return success;
    } catch (error) {
        await edition.saveName.set(backupName);
        await showError('Error', 'Error encountered while trying to save', error);
    }
    return false;
}

/**
 * show loading dialog while saving
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function save(edition:Edition):Promise<boolean> {
    const saveName = edition.saveName.get();
    try {
        switch (saveName) {
            case '':
                return await saveAs(edition);
            default:
                return await _save((await signIn()).token, edition, true);
        }
    } catch (error) {
        await showError('Error', 'Error encountered while trying to save', error);
        return false;
    }
}

type Separated = {
    edition:unknown,
    logo?:string,
    sourceImages:Map<string,string>,
    finalImages:Map<string,string>
};

/** separate the edition json and images for saving as separate files */
async function separateImages(edition:Edition):Promise<Separated> {
    const saveName = edition.saveName.get();
    const editionSerialized = await edition.serialize();
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
    const meta = editionSerialized.meta as {logo?:string};
    const logo:string|undefined = meta.logo;
    if (logo && logo.startsWith('data:')) {
        meta.logo = `https://www.bloodstar.xyz/save/${saveName}/_meta.png`;
    }
    
    return {
        edition:editionSerialized,
        logo,
        sourceImages,
        finalImages
    };
}

/**
 * Save the file under the name saved in it
 * Brings up the loading spinner during the operation
 * @param authToken user authorization
 * @param edition file to save
 * @param clobber true if you want it to replace any file found with the same name
 * @returns promise resolving to whether the save was successful
 */
async function _save(authToken:string, edition:Edition, clobber:boolean):Promise<boolean> {
    type SaveData = {
        token:string,
        saveName:string,
        edition?:unknown,
        id?:string,
        isSource?:boolean,
        image?:string,
        clobber?:boolean
    };
    type SaveResult = {
        success?:true,
        clobberWarning?:string,
        error?:string,
    };
    // serialize the edition, but break images out into separate pieces to save
    const toSave = await separateImages(edition);

    // save JSON
    const saveName = edition.saveName.get();
    {
        const saveData:SaveData = {
            token: authToken,
            saveName: saveName,
            clobber,
            edition: toSave.edition
        };
        let {clobberWarning,error} = await cmd<SaveResult>('save', `Saving edition data`, JSON.stringify(saveData));
        if (clobberWarning) {
            // confirmation dialog, then try again
            const okToClobber = await new AriaDialog<boolean>().baseOpen(
                null,
                'okToClobber',
                [{t:'p',txt:`There is already a save file named ${saveName}. Would you like to replace it?`}],
                [
                    {label:`Yes, Replace ${saveName}`,callback:()=>true},
                    {label:'No, Cancel Save',callback:()=>false},
                ]
            );
            if (!okToClobber) {return false;}
            saveData.clobber = true;
            ({clobberWarning,error} = await cmd<SaveResult>('save', `Saving edition data`, JSON.stringify(saveData)));
            error = error || clobberWarning;
        }
        // surface error, if any
        if (error){
            await showError('Error', `Error encountered while trying to save ${saveName}`, error);
            return false;
        }
    }

    const promises = [];

    for (const [id,imageString] of toSave.sourceImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.isCharacterSourceImageDirty(id)) {continue;}
        promises.push(Locks.enqueue('saveImage', ()=>{
            const saveData:SaveData = {
                token: authToken,
                saveName: saveName,
                id: id,
                isSource:true,
                image: imageString
            };
            const payload = JSON.stringify(saveData);
            return cmd('save-img', `Saving ${id}.src.png`, payload);
        }, MAX_SIMULTANEOUS_IMAGE_SAVES));
    }

    for (const [id,imageString] of toSave.finalImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.isCharacterFinalImageDirty(id)) {continue;}
        promises.push(Locks.enqueue('saveImage', ()=>{
            const saveData:SaveData = {
                token: authToken,
                saveName: saveName,
                id: id,
                isSource:false,
                image: imageString
            };
            const payload = JSON.stringify(saveData);
            return cmd('save-img', `Saving ${id}.png`, payload);
        }, MAX_SIMULTANEOUS_IMAGE_SAVES));
    }

    {
        const logo = toSave.logo;
        if (logo && logo.startsWith('data:') && edition.isLogoDirty()) {
            promises.push(Locks.enqueue('saveImage', ()=>{
                const saveData:SaveData = {
                    token: authToken,
                    saveName: saveName,
                    id: '_meta',
                    isSource:false,
                    image: logo
                };
                const payload = JSON.stringify(saveData);
                return cmd('save-img', `Saving _meta.png`, payload);
            }, MAX_SIMULTANEOUS_IMAGE_SAVES));
        }
    }

    // await results
    const results = await spinner('save', `Saving as ${saveName}`, Promise.all(promises)) as SaveReturn[];
    for (const {error} of results) {
        if (error) {
            await showError('Error', `Error encountered while trying to save ${saveName}`, error);
            return false;
        }
    }

    // mark things as up to date
    await edition.markClean();
    
    // update recent file
    setRecentFile(saveName);
    return true;
}

/**
 * prompt the user to enter a name to save as
 */
async function promptForName(defaultName:string):Promise<string|null> {
    return await inputDlg(
        'Save',
        'Enter name to save as.',
        defaultName,
        {
            pattern:'[A-Za-z0-9\\-_]{1,25}',
            hint: 'Name should contain only letters, numbers, hyphens (-), and underscores (_)',
            validateFn: validateSaveName,
            warningsFn: updateSaveNameWarnings
        });
}
