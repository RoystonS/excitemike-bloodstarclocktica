/**
 * code related to save commands
 * @module Save
 */
import {show as inputDlg} from '../dlg/blood-string-dlg';
import { Edition } from '../model/edition';
import { showError, show as showMessage } from '../dlg/blood-message-dlg';
import Locks from '../lock';
import {spinner} from '../dlg/spinner-dlg';
import { AriaDialog } from '../dlg/aria-dlg';
import { setRecentFile } from '../recent-file';
import { updateSaveNameWarnings, validateSaveName } from '../validate';
import {signedInCmd, signIn} from '../sign-in';
import { SessionInfo } from '../iam';
import { imageUrlToDataUri } from '../blood-image';

type SaveData = {
    clobber?:boolean;
    edition:unknown;
    saveName:string;
    token:string;
};
type SaveImgData = {
    token:string;
    saveName:string;
    id:string;
    isSource:boolean;
    image:string;
};
type SaveResult = 'cancel' | 'clobber' | {error:string} | {success:true};
type SaveImgResult = {error:string}|{success:true};

const MAX_SIMULTANEOUS_IMAGE_SAVES = 8;

/** got a clobber warning. have the user confirm, then maybe continue */
async function confirmClobber(saveData:SaveData):Promise<SaveResult> {
    // confirmation dialog, then try again
    const okToClobber = await new AriaDialog<boolean>().baseOpen(
        null,
        'okToClobber',
        [{t:'p', txt:`There is already a save file named ${saveData.saveName}. Would you like to replace it?`}],
        [
            {label:`Yes, Replace ${saveData.saveName}`, callback:()=>true},
            {label:'No, Cancel Save', callback:()=>false},
        ]
    );
    if (!okToClobber) {return 'cancel';}
    const saveDataClone = { ...saveData };
    saveDataClone.clobber = true;
    return signedInCmd<SaveResult>('save', `Saving edition data`, saveDataClone);
}

/**
 * prompt for a name, then save with that name
 * Brings up the loading spinner during the operation
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function saveAs(edition:Edition):Promise<boolean> {
    const name = await promptForName(edition.saveName.get());
    if (name === null) {return false;}
    const sessionInfo = await signIn({
        title:'Sign In to Save',
        message:'You must first sign in if you wish to save.'
    });
    if (!sessionInfo) {return false;}

    if (!validateSaveName(name)) {
        await showMessage('Invalid File Name', `"${name}" is not a valid filename.`);
        return false;
    }

    const backupName = edition.saveName.get();
    try {
        await edition.saveName.set(name);
        await edition.markDirty();
        await spinner('saveAs.regeneratingimages', 'Copying Images', edition.regenAllIds());
        const success = await _save(sessionInfo, edition, backupName===name);
        if (!success) {
            await edition.saveName.set(backupName);
        }
        return success;
    } catch (error: unknown) {
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
            {
                const sessionInfo = await signIn({
                    title:'Sign In to Save',
                    message:'You must first sign in if you wish to save.'
                });
                if (!sessionInfo) {return false;}
                return await _save(sessionInfo, edition, true);
            }
        }
    } catch (error: unknown) {
        await showError('Error', 'Error encountered while trying to save', error);
        return false;
    }
}

type Separated = {
    edition:unknown;
    logo?:string;
    sourceImages:Map<string, string>;
    finalImages:Map<string, string>;
};

/** separate the edition json and images for saving as separate files */
async function separateImages(username:string, edition:Edition):Promise<Separated> {
    const saveName = edition.saveName.get();
    const editionSerialized = await edition.serialize();
    const characters = editionSerialized.characterList as {id:string; unStyledImage?:string; styledImage?:string}[];
    const sourceImages = new Map<string, string>();
    const finalImages = new Map<string, string>();
    for (const character of characters) {
        const {id} = character;
        if (!id) {continue;}

        const unStyledImageStr = character.unStyledImage;
        if (unStyledImageStr?.startsWith('data:')) {
            character.unStyledImage = `https://www.bloodstar.xyz/usersave/${username}/${saveName}/${id}.src.png`;
            sourceImages.set(id, unStyledImageStr);
        }

        const styledImageStr = character.styledImage;
        if (styledImageStr?.startsWith('data:')) {
            character.styledImage = `https://www.bloodstar.xyz/usersave/${username}/${saveName}/${id}.png`;
            finalImages.set(id, styledImageStr);
        }
    }
    const meta = editionSerialized.meta as {logo?:string};
    const {logo} = meta;
    if (logo?.startsWith('data:')) {
        meta.logo = `https://www.bloodstar.xyz/usersave/${username}/${saveName}/_meta.png`;
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
 * @param sessionInfo current user session
 * @param edition file to save
 * @param clobber true if you want it to replace any file found with the same name
 * @returns promise resolving to whether the save was successful
 */
async function _save(sessionInfo:SessionInfo, edition:Edition, clobber:boolean):Promise<boolean> {
    // serialize the edition, but break images out into separate pieces to save
    const toSave = await separateImages(sessionInfo.username, edition);

    // save JSON
    const saveName = edition.saveName.get();

    const saveData:SaveData = {
        token: sessionInfo.token,
        saveName: saveName,
        clobber,
        edition: toSave.edition
    };
    let response = await signedInCmd<SaveResult>('save', `Saving edition data`, saveData);
    if (response==='clobber') {
        response = await confirmClobber(saveData);
    }

    // surface the error, if any
    if (response==='cancel') {return false;}
    if (response==='clobber') {return false;}
    if ('error' in response) {
        await showError('Error', `Error encountered while trying to save ${saveName}`, response.error);
        return false;
    }

    const promises = [];

    for (const [id, imageString] of toSave.sourceImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.isCharacterSourceImageDirty(id)) {continue;}
        promises.push(Locks.enqueue('saveImage', async ()=>{
            const saveImgData:SaveImgData = {
                token: sessionInfo.token,
                saveName: saveName,
                id: id,
                isSource:true,
                image: imageString
            };
            return signedInCmd('save-img', `Saving ${id}.src.png`, saveImgData);
        }, MAX_SIMULTANEOUS_IMAGE_SAVES));
    }

    for (const [id, imageString] of toSave.finalImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.isCharacterFinalImageDirty(id)) {continue;}
        promises.push(Locks.enqueue('saveImage', async ()=>{
            const saveImgData:SaveImgData = {
                token: sessionInfo.token,
                saveName: saveName,
                id: id,
                isSource:false,
                image: imageString
            };
            return signedInCmd('save-img', `Saving ${id}.png`, saveImgData);
        }, MAX_SIMULTANEOUS_IMAGE_SAVES));
    }

    if (toSave.logo && edition.isLogoDirty()) {
        const sourceUrl = new URL(toSave.logo);
        const isDataUri = sourceUrl.protocol === 'data:';
        let {logo} = toSave;
        if (!isDataUri) {
            const useCors = sourceUrl.hostname !== window.location.hostname;
            logo = await imageUrlToDataUri(toSave.logo, useCors);
        }
        if (logo.startsWith('data:')) {
            promises.push(Locks.enqueue('saveImage', async ()=>{
                const saveImgData:SaveImgData = {
                    token: sessionInfo.token,
                    saveName: saveName,
                    id: '_meta',
                    isSource:false,
                    image: logo||''
                };
                return signedInCmd('save-img', `Saving _meta.png`, saveImgData);
            }, MAX_SIMULTANEOUS_IMAGE_SAVES));
        }
    }

    // await results
    const results = await spinner('save', `Saving as ${saveName}`, Promise.all(promises)) as SaveImgResult[];
    for (const imgSaveResponse of results) {
        if ('error' in imgSaveResponse) {
            await showError('Error', `Error encountered while trying to save ${saveName}`, imgSaveResponse.error);
            return false;
        }
    }

    // mark things as up to date
    await edition.markClean();

    // update recent file
    setRecentFile(saveName, sessionInfo.email);
    return true;
}

/**
 * prompt the user to enter a name to save as
 */
async function promptForName(defaultName:string):Promise<string|null> {
    return inputDlg(
        'Save',
        'Enter name to save as.',
        defaultName,
        {
            pattern:'[A-Za-z0-9\\-_]{1,25}',
            hint: 'Name should contain only letters, numbers, hyphens (-), and underscores (_)',
            validateFn: validateSaveName,
            warningsFn: (input:string, container:HTMLElement)=>{ updateSaveNameWarnings(input, container, 'Save name'); }
        });
}
