/**
 * import code for .blood files
 * @module BloodFile
 */
import {savePromptIfDirty} from '../dlg/blood-save-discard-cancel';
import {show as showSpinner} from '../dlg/spinner-dlg';
import {Edition} from '../model/edition';
import { JSZipObject, loadAsync as loadZipAsync} from 'jszip';
import { AriaDialog } from '../dlg/aria-dlg';
import { createElement } from '../util';
import { Character } from '../model/character';
import { Property } from '../bind/bindings';
import { ObservableCollection } from '../bind/observable-collection';
import LockSet from '../lock';
import { parseBloodTeam } from '../model/blood-team';

/** set property if the value is not undefined */
async function trySet<T>(value:T|undefined, property:Property<T>):Promise<void> {
    if (value !== undefined) {
        await property.set(value);
    }
}

/** keep image work from overlapping in the same character */
const characterLockSet = new LockSet<Character>();

const ensureCharacterLock = new LockSet<0>();

class BloodImporter {
    private readonly firstNightOrderTracker = new Map<number, Character[]>();
    private readonly otherNightOrderTracker = new Map<number, Character[]>();
    private readonly charactersById = new Map<string, Character>();
    private readonly edition:Edition;

    constructor(edition:Edition) {
        this.edition = edition;
    }

    /** import a whole blood file */
    async importBlood(file:File):Promise<boolean> {
        const zip = await loadZipAsync(file);
        const allPaths:string[] = [];
        zip.forEach(relativePath=>allPaths.push(relativePath));

        const promises:Promise<boolean>[] = [];
        // TODO: do source images before processed images
        for (const relativePath of allPaths) {
            const zipEntry = zip.file(relativePath);
            if (!zipEntry) {continue;}
            promises.push(this.importPart(relativePath, zipEntry));
        }
        const allImported = (await Promise.all(promises)).reduce((a,b)=>a&&b, true);
        if (!allImported) { return false; }
    
        await this.finalizeNightOrder();

        return true;
    }

    /** once all character are loaded, correct the night order */
    private async finalizeNightOrder():Promise<void> {
        const data:[Map<number, Character[]>, ObservableCollection<Character>][] = [[this.firstNightOrderTracker, this.edition.firstNightOrder],[this.otherNightOrderTracker, this.edition.otherNightOrder]];
        for (const [nightMap, collection] of data) {
            const keys = Array.from(nightMap.keys()).sort();
            await collection.clear();
            for (const key of keys) {
                await collection.addMany(nightMap.get(key) || []);
            }
        }
    }

    /** load from the meta portion of a .blood into the edition */
    private async importMeta(zipEntry:JSZipObject):Promise<boolean> {
        const text = await zipEntry.async('text');
        const json = JSON.parse(text);
        await trySet(json.name, this.edition.meta.name);
        await trySet(json.author, this.edition.meta.author);
        await trySet(json.synopsis, this.edition.almanac.synopsis);
        await trySet(json.overview, this.edition.almanac.overview);
        return true;
    }

    /** load a processed image from the .blood file */
    private async importProcessedImage(character:Character, zipEntry:JSZipObject):Promise<boolean> {
        const id = character.id.get();
        if (character.unStyledImage.get()) { return true; } // don't clobber source image
        const base64 = await zipEntry.async('base64');
        await character.unStyledImage.set(`data:image/png;base64,${base64}`);
        await character.imageSettings.shouldRestyle.set(false); // image is pre-processed
        this.charactersById.set(id, character);
        return true;
    }

    /** make sure that acharacter exists in the edition/map before continuing */
    private async ensureCharacter(id:string):Promise<Character> {
        return ensureCharacterLock.enqueue(0, async ()=>{
            let character = this.charactersById.get(id);
            if (!character) {
                character = await this.edition.addNewCharacter();
                await character.id.set(id);
                this.charactersById.set(id, character);
            }
            return character;
        })
    }

    /** import part of a .blood file */
    private async importPart(relativePath:string, zipEntry:JSZipObject):Promise<boolean> {
        if (relativePath === 'logo.png') {
            const base64 = await zipEntry.async('base64');
            await this.edition.meta.logo.set(`data:image/png;base64,${base64}`);
            return true;
        } else if (relativePath === 'meta.json') {
            return await this.importMeta(zipEntry);
        } else if (relativePath.startsWith('roles/') && relativePath.endsWith('.json')) {
            const id = relativePath.slice(6, relativePath.length - 5);
            const character = await this.ensureCharacter(id);
            return await this.importRole(character, zipEntry);
        } else if (relativePath.startsWith('src_images/') && relativePath.endsWith('.png')) {
            const id = relativePath.slice(11, relativePath.length - 4);
            const character = await this.ensureCharacter(id);
            characterLockSet.enqueue(
                character,
                async ()=>await this.importSourceImage(character, zipEntry)
            );
        } else if (relativePath.startsWith('processed_images/') && relativePath.endsWith('.png')) {
            const id = relativePath.slice(17, relativePath.length - 4);
            const character = await this.ensureCharacter(id);
            return await characterLockSet.enqueue(
                character,
                async ()=>await this.importProcessedImage(character, zipEntry)
            );
        } else {
            console.error(`unhandled bloodfile part "${relativePath}"`);
        }
        return false;
    }

    /** load a json from the roles directory of the .blood file */
    private async importRole(character:Character, zipEntry:JSZipObject):Promise<boolean> {
        const text = await zipEntry.async('text');
        const json = JSON.parse(text);
        await trySet(json.name, character.name);
        await trySet(json.setup, character.setup);
        await trySet(json.ability, character.ability);
        await trySet(json.firstNightReminder, character.firstNightReminder);
        await trySet(json.otherNightReminder, character.otherNightReminder);
        await trySet(json.includeInExport, character.export);

        const almanac = json.almanacEntry;
        if (almanac) {
            await trySet(almanac.flavor, character.almanac.flavor);
            await trySet(almanac.overview, character.almanac.overview);
            await trySet(almanac.examples, character.almanac.examples);
            await trySet(almanac.howToRun, character.almanac.howToRun);
            await trySet(almanac.tip, character.almanac.tip);
        }

        if (json.team) {
            await character.team.set(parseBloodTeam(json.team));
        }
        if (json.reminders) {
            await character.characterReminderTokens.set(json.reminders.join('\n'))
        }
        if (json.globalReminders) {
            await character.globalReminderTokens.set(json.globalReminders.join('\n'))
        }
        {
            const firstNightNumber = json.firstNight || 0;
            const fno = this.firstNightOrderTracker.get(firstNightNumber) || [];
            fno.push(character);
            this.firstNightOrderTracker.set(firstNightNumber, fno);
        }
        {
            const otherNightNumber = json.otherNight || 0;
            const ono = this.otherNightOrderTracker.get(otherNightNumber) || [];
            ono.push(character);
            this.otherNightOrderTracker.set(otherNightNumber, ono);
        }

        this.charactersById.set(character.id.get(), character);
        return true;
    }

    /** load a source image from the .blood file */
    private async importSourceImage(character:Character, zipEntry:JSZipObject):Promise<boolean> {
        const base64 = await zipEntry.async('base64');
        await character.unStyledImage.set(`data:image/png;base64,${base64}`);
        await character.imageSettings.shouldRestyle.set(true); // restore if set by importProcessedImage
        const id = character.id.get();
        this.charactersById.set(id, character);
        return true;
    }
}

/** promise for choosing a JSON file */
async function chooseBloodFile():Promise<File|null> {
    const fileInput = createElement({t:'input',a:{type:'file',accept:'.blood'},css:['hidden']});
    if (!(fileInput instanceof HTMLInputElement)) {return null;}
    const dlg = new AriaDialog<File|null>();

    async function chooseFile():Promise<void> {
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
        'chooseBloodFile',
        [{
            t:'button',
            txt:'Choose File',
            events:{click:()=>chooseFile()}
        }],
        [
            {label:'Cancel',callback:async ()=>null}
        ]
    );
}

/** user chose to import a .blood file */
export async function importBloodFile(edition:Edition):Promise<boolean> {
    if (!await savePromptIfDirty(edition)) {return false;}
    const file = await chooseBloodFile();
    if (!file){return false;}
    await edition.reset();
    await edition.characterList.clear();
    const importer = new BloodImporter(edition);
    return await showSpinner('Importing .blood', importer.importBlood(file)) || false;
}
