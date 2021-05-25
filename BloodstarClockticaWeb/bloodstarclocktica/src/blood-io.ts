// TODO: phase out this whole module
import {Edition} from './model/edition';
import {spinner} from './dlg/spinner-dlg';
import * as SdcDlg from './dlg/blood-save-discard-cancel';
import * as StringDlg from './dlg/blood-string-dlg';
import {importJson, ScriptEntry} from './import/json';
import { fetchJson } from './util';
import { AriaDialog } from './dlg/aria-dlg';
import { importBloodFile } from './import/blood-file';

/// prompt for save if needed, then reset to new custom edition
export async function newEdition(edition:Edition):Promise<boolean> {
    if (await SdcDlg.savePromptIfDirty(edition)) {
        await edition.reset();
        return true;
    }
    return false;
}

/** user chose to import character(s) from a json file */
export async function importJsonFromUrl(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    const url = await StringDlg.show('Enter URL', 'Enter URL to a custom-script.json file.');
    if (!url){return false;}
    const json = await fetchJson<ScriptEntry[]>(url);
    if (!json) {return false;}
    return await spinner('importJsonFromUrl', 'Importing json', importJson(json, edition)) || false;
}

/** promise for choosing a JSON file */
async function chooseJsonFile():Promise<File|null> {
    const fileInput = document.getElementById('jsonFileInput');
    if (!(fileInput instanceof HTMLInputElement)) {return null;}
    fileInput.value = '';
    const dlg = new AriaDialog<File|null>();

    function chooseFile():void {
        if (fileInput instanceof HTMLInputElement) {
            fileInput.onchange=()=>{
                dlg.close(fileInput.files && fileInput.files[0]);
            };
            fileInput.click();
        } else {
            dlg.close(null)
        }
    }
    
    return await dlg.baseOpen(
        document.activeElement,
        'chooseJsonFile',
        [
            {t:'h1',txt:'Choose file'},
            {t:'div',css:['dialogBtnGroup'],children:[
                {t:'button',txt:'Choose File',events:{click:()=>chooseFile()}},
                {t:'button',txt:'Cancel',events:{click:()=>dlg.close()}}
            ]}
        ],
        []
    );
}

/** user chose to import character(s) from a json file */
export async function importJsonFromFile(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    const file = await chooseJsonFile();
    if (!file){return false;}
    return await importJson(file, edition);
}

/** user chose to import a project form the windows version of Bloodstar Clocktica */
export async function importBlood(edition:Edition):Promise<boolean> {
    if (!await SdcDlg.savePromptIfDirty(edition)) {return false;}
    return await importBloodFile(edition);
}
