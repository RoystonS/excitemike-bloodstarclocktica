/**
 * import code for .blood files
 * @module BloodFile
 */
import {Edition} from '../model/edition';
import JSZip from 'jszip';

// TODO: dialog with HTMLInputElement
// HTMLInputElement change listener should:
//      - const extracted = await JSZip.loadAsync(element.files[0]);
//      - close the dialog

/**
 * designed to be used with an input[type="file"] element like so:
 * ```javascript
 * await BloodFile.importAll(element.files[0], edition);
 * ```
 */
export async function importAll(file:File, edition:Edition):Promise<void> {
    edition.reset();
    const zip = await JSZip.loadAsync(file);
    zip.forEach((relativePath, zipEntry)=>{
        // TODO: update edition based on zip file contents
    });
}