/**
 * code related to save commands
 * @module Save
 */
import {show as inputDlg} from '../dlg/blood-string-dlg';
import { Edition } from '../model/edition';
import { showError, show as showMessage } from '../dlg/blood-message-dlg';
import Locks from '../lock';
import {spinner} from '../dlg/spinner-dlg';
import { setRecentFile } from '../recent-file';
import { updateSaveNameWarnings, validateSaveName } from '../validate';
import { imageUrlToDataUri } from '../blood-image';
import genericCmd, { GenericCmdOptions } from './generic-cmd';
import signIn from '../sign-in';

type SaveRequest = {
    clobber?:boolean;
    edition:unknown;
    saveName:string;
    token:string;
};
type SaveImgRequest = {
    token:string;
    saveName:string;
    id:string;
    isSource:boolean;
    image:string;
};
type SaveResponse = 'cancel' | 'clobber' | {success:true};
type SaveImgResponse = {success:true};

const MAX_SIMULTANEOUS_IMAGE_SAVES = 4;

/**
 * prompt for a name, then save with that name
 * Brings up the loading spinner during the operation
 * @param edition file to save
 * @returns promise resolving to whether the save was successful
 */
export async function saveAs(edition:Edition):Promise<boolean> {
    const name = await promptForName(edition.saveName.get());
    if (name === null) {return false;}

    if (!validateSaveName(name)) {
        await showMessage('Invalid File Name', `"${name}" is not a valid filename.`);
        return false;
    }

    const backupName = edition.saveName.get();
    try {
        await edition.saveName.set(name);
        await edition.markDirty();
        await spinner('saveAs.regeneratingimages', 'Copying Images', edition.regenAllIds());
        const success = await _save(edition, backupName===name);
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
                return await _save(edition, true);
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
 * @param edition file to save
 * @param clobber true if you want it to replace any file found with the same name
 * @returns promise resolving to whether the save was successful
 */
async function _save(edition:Edition, clobber:boolean):Promise<boolean> {
    const signInOptions = {
        title:'Sign In to Save',
        message:'You must first sign in if you wish to save.'
    };
    const sessionInfo = await signIn(signInOptions);
    if (!sessionInfo) {return false;}
    const editionSaveName = edition.saveName.get();

    // serialize the edition, but break images out into separate pieces to save
    const toSave = await separateImages(sessionInfo.username, edition);

    // save JSON
    if (!await _saveJson(editionSaveName, toSave.edition, clobber)) { return false; }

    const imgSavePromises = [];

    for (const [id, imageString] of toSave.sourceImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.isCharacterSourceImageDirty(id)) {continue;}
        imgSavePromises.push(Locks.enqueue('saveImage', async ()=>_savePng(editionSaveName, id, imageString, true), MAX_SIMULTANEOUS_IMAGE_SAVES));
    }

    for (const [id, imageString] of toSave.finalImages) {
        if (!imageString.startsWith('data:')) {continue;}
        if (!edition.isCharacterFinalImageDirty(id)) {continue;}
        imgSavePromises.push(Locks.enqueue('saveImage', async ()=>_savePng(editionSaveName, id, imageString, false), MAX_SIMULTANEOUS_IMAGE_SAVES));
    }

    if (toSave.logo && edition.isLogoDirty()) {
        const sourceUrl = new URL(toSave.logo, location.origin);
        const isDataUri = sourceUrl.protocol === 'data:';
        let {logo} = toSave;
        if (!isDataUri) {
            logo = await imageUrlToDataUri(toSave.logo);
        }
        if (logo.startsWith('data:')) {
            imgSavePromises.push(Locks.enqueue('saveImage', async ()=>_savePng(editionSaveName, '_meta', logo, false), MAX_SIMULTANEOUS_IMAGE_SAVES));
        }
    }

    // await results
    // TODO: _savePng should accept a cancel token so that if one fails we can kill the rest
    for (const result of await spinner('save', `Saving as ${editionSaveName}`, Promise.all(imgSavePromises))) {
        if ('error' in result) {
            await showError('Error', `Error encountered while trying to save ${editionSaveName}`, result.error);
            return false;
        }
    }

    // mark things as up to date
    await edition.markClean();

    // update recent file
    setRecentFile(editionSaveName, sessionInfo.email);
    return true;
}

/** helper for _save */
async function _saveJson(saveName:string, serializedEdition:unknown, clobber:boolean):Promise<boolean> {
    const saveCmdOptions:GenericCmdOptions<SaveRequest> = {
        command:'save',
        errorMessage:`Error encountered while trying to save ${saveName}`,
        request:sessionInfo=>({
            token: sessionInfo?.token ?? '',
            saveName: saveName,
            clobber,
            edition: serializedEdition
        }),
        signIn:{
            title:'Sign In to Save',
            message:'You must first sign in if you wish to save.'
        },
        spinnerMessage:'Saving edition data',
    };
    let response = await genericCmd<SaveRequest, SaveResponse>(saveCmdOptions);
    if (!('data' in response)) {return false;}
    if (response.data==='clobber') {
        // try again with confirmation dialog
        saveCmdOptions.confirmOptions = {
            message:`There is already a save file named ${saveName}. Would you like to replace it?`,
            noLabel:'No, Cancel Save',
            title:'Confirm Overwrite',
            yesLabel:`Yes, Replace ${saveName}`
        };
        saveCmdOptions.request = sessionInfo=>({
            token: sessionInfo?.token ?? '',
            saveName: saveName,
            clobber:true,
            edition: serializedEdition
        });
        response = await genericCmd<SaveRequest, SaveResponse>(saveCmdOptions);
        if (!('data' in response)) {return false;}
    }

    if (response.data==='cancel') {return false;}
    if (response.data==='clobber') {return false;}
    return response.data.success;
}

/** helper for _save */
async function _savePng(editionSaveName:string, imageId:string, imageString:string, isSource:boolean):Promise<{error:string}|{success:true}> {
    const response = await genericCmd<SaveImgRequest, SaveImgResponse>({
        command: 'save-img',
        errorMessage: `Error occurred while saving ${imageId}.src.png`,
        request:sessionInfo=>({
            token: sessionInfo?.token ?? '',
            saveName: editionSaveName,
            id: imageId,
            isSource,
            image: imageString
        }),
        signIn:{
            title:'Sign In to Save',
            message:'You must first sign in if you wish to save.'
        },
        spinnerMessage:`Saving ${imageId}.src.png`
    });
    if ('error' in response) {return response;}
    if ('cancel' in response) {return {error:`cancel reason: ${response.cancel}`};}
    if (typeof response.data === 'string') {return {error:`cancel reason: ${response.data}`};}
    return response.data;
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
