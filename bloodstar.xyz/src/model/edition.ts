/**
 * Model for edition data
 * @module Edition
 */
import {Property} from '../bind/bindings';
import {spinner} from '../dlg/spinner-dlg';
import {Character} from './character';
import {EditionAlmanac} from './edition-almanac';
import {EditionMeta} from './edition-meta';
import {ObservableCollection, ObservableCollectionChangeAction} from '../bind/observable-collection';
import {observableChild, observableCollection, ObservableObject, observableProperty, ObservableType, PropKey} from '../bind/observable-object';

function serializeJustIds(_:ObservableObject<Edition>, nightOrder:ObservableType):unknown {
    if (!(nightOrder instanceof ObservableCollection)) {return [];}
    return nightOrder.map((c:Character)=>c.id.get())
}
async function deserializeFromIds(object:ObservableObject<Edition>, nightOrder:ObservableType, data:unknown):Promise<void> {
    if (!(nightOrder instanceof ObservableCollection)) {return;}
    if (!Array.isArray(data)){return;}
    const characterList = object.getCollection('characterList');
    if (!(characterList instanceof ObservableCollection)) {return;}

    const charactersById = new Map<string, Character>();
    for (const character of characterList) {
        if (!(character instanceof Character)) {
            return;
        }
        charactersById.set(character.id.get(), character);
    }

    {
        const missingCharacters = new Set<Character>(characterList);
        const orderedCharacters = [];
        for (const id of data) {
            const character = charactersById.get(String(id));
            if (character===undefined){
                console.error(`deserializeFromIds: no character found for id ${id}`);
            } else {
                missingCharacters.delete(character);
                orderedCharacters.push(character);
            }
        }

        // characters left out. probably due to duplicate ids. stick them at the end
        orderedCharacters.splice(orderedCharacters.length, 0, ...missingCharacters);
        await nightOrder.set(orderedCharacters);
    }
}

/** observable properties for a custom edition */
export class Edition extends ObservableObject<Edition> {
    /** almanac-specific edition data */
    @observableChild(EditionAlmanac)
    readonly almanac!:EditionAlmanac;

    /** characters in the edition */
    @observableCollection(Character.asyncNew)
    readonly characterList!:ObservableCollection<Character>;

    /** true when there are unsaved changes */
    @observableProperty(false, {read:false,write:false})
    readonly dirty!:Property<boolean>;

    /** contains the same Character objects as characterList, but ordered for night order */
    @observableCollection(Character.asyncNew, {customSerialize:serializeJustIds,customDeserialize:deserializeFromIds})
    readonly firstNightOrder!:ObservableCollection<Character>;

    /** data about the edition */
    @observableChild(EditionMeta)
    readonly meta!:EditionMeta;

    /** contains the same Character objects as characterList, but ordered for night order */
    @observableCollection(Character.asyncNew, {customSerialize:serializeJustIds,customDeserialize:deserializeFromIds})
    readonly otherNightOrder!:ObservableCollection<Character>;
    
    /** whether to render preview on a character token background like you would see on clocktower.online */
    @observableProperty(true, {read:false,write:false})
    readonly previewOnToken!:Property<boolean>;

    /** name to use when saving */
    @observableProperty('', {read:false,write:false})
    readonly saveName!:Property<string>;

    /** what to show as the current file and its status */
    @observableProperty('Bloodstar Clocktica', {read:false,write:false})
    readonly windowTitle!:Property<string>;

    /** source images that need to be saved */
    private readonly dirtySourceImages = new Set<string>();

    /** final images that need to be saved */
    private readonly dirtyFinalImages = new Set<string>();

    /** whether the logo has changed since save/open */
    private dirtyLogo = false;

    static async asyncNew():Promise<Edition>
    {
        const edition = new Edition();
        await edition.addNewCharacter();

        // set dirty flag when most things change and update window title when dirty or savename change
        edition.addPropertyChangedEventListener(async propName=>{
            switch (propName) {
                case 'dirty':
                case 'saveName':
                    await edition.windowTitle.set(`File: ${(edition.dirty.get() ? '[unsaved changes] ' : '')}${edition.saveName.get() || '[unnamed]'}`);
                    break;
                case 'windowTitle':
                    break;
                default:
                    await edition.dirty.set(true);
                    break;
            }
        });

        // watch for dirtying of images
        edition.characterList.addItemChangedListener((_:number, character:Character, propName:PropKey<Character>) => {
            switch (propName) {
                case 'id':
                    edition.dirtySourceImages.add(character.id.get());
                    edition.dirtyFinalImages.add(character.id.get());
                    break;
                case 'unStyledImage':
                    edition.dirtySourceImages.add(character.id.get());
                    break;
                case 'styledImage':
                    edition.dirtyFinalImages.add(character.id.get());
                    break;
            }
        });

        // propagate character list changes to night order lists and dirty maps
        const propagateAdd = async (newItems:readonly Character[])=>{
            await edition.firstNightOrder.addMany(newItems);
            await edition.otherNightOrder.addMany(newItems);
        };

        // propagate character list changes to night order lists and dirty maps
        const propagateRemoval = async (oldItems:readonly Character[])=>{
            for (const character of oldItems) {
                const id = character.id.get();
                edition.dirtySourceImages.delete(id);
                edition.dirtyFinalImages.delete(id);
                await edition.firstNightOrder.deleteItem(character);
                await edition.otherNightOrder.deleteItem(character);
            }
        };

        edition.characterList.addCollectionChangedListener(async event=>{
            switch (event.action) {
                case ObservableCollectionChangeAction.Add:
                    await propagateAdd(event.newItems);
                    break;
                case ObservableCollectionChangeAction.Move:
                    break;
                case ObservableCollectionChangeAction.Remove:
                    await propagateRemoval(event.oldItems);
                    break;
                case ObservableCollectionChangeAction.Replace:
                    await propagateRemoval(event.oldItems);
                    await propagateAdd(event.newItems);
                    break;
                default:
                    throw new Error(`Unhandled case "${event.action}" when propagating character list change to night order lists`);
            }
        });

        // watch for dirtying of logo
        edition.meta.logo.addListener(()=>{
            edition.dirtyLogo = true;
        });

        // changing save name needs to mark all images as needing re-saving
        edition.saveName.addListener(()=>{
            edition.dirtyLogo = true;
            for (const existingCharacter of edition.characterList) {
                const id = existingCharacter.id.get();
                edition.dirtySourceImages.add(id);
                edition.dirtyFinalImages.add(id);
            }
        });

        return edition
    }

    /** add a new character to the set */
    async addNewCharacter():Promise<Character> {
        const character = await Character.asyncNew();
        await this.makeNameAndIdUnique(character);
        await this.characterList.add(character);
        return character;
    }

    /** make sure there are no duplicate ids */
    private async fixDuplicateIds():Promise<void> {
        const ids = new Set<string>();
        for (const character of this.characterList) {
            let id = character.id.get();
            if (ids.has(id)){
                while (ids.has(id)){
                    id = `${id}${(Math.random()*10)|0}`;
                }
                await character.id.set(id);
            }
            ids.add(id);
        }
    }

    /** check whether image needs saving */
    isCharacterFinalImageDirty(id:string):boolean{return this.dirtyFinalImages.has(id);}

    /** check whether image needs saving */
    isCharacterSourceImageDirty(id:string):boolean{return this.dirtySourceImages.has(id);}

    /** check whether image needs saving */
    isLogoDirty():boolean{return this.dirtyLogo;}

    /** make sure the name and id of a newly added character aren't taken */
    async makeNameAndIdUnique(character:Character):Promise<void> {
        let i = 1;
        const originalId = character.id.get();
        const originalName = character.name.get();
        let matchFound;
        do {
            matchFound = false;
            for (const existingCharacter of this.characterList) {
                if ((existingCharacter.id.get() === character.id.get()) || (existingCharacter.name.get() === character.name.get())) {
                    matchFound = true;
                    await character.id.set(originalId + i);
                    await character.name.set(originalName + i);
                    i++;
                    break;
                }
            }
        } while (matchFound);
    }

    /** edition was just opened or saved */
    async markClean():Promise<void> {
        this.dirtySourceImages.clear();
        this.dirtyFinalImages.clear();
        this.dirtyLogo = false;
        await this.dirty.set(false);
    }

    /** mark every part of the edition as needing a save */
    async markDirty():Promise<void> {
        for (const character of this.characterList) {
            const id = character.id.get();
            this.dirtySourceImages.add(id);
            this.dirtyFinalImages.add(id);
        }
        this.dirtyLogo = true;
        await this.dirty.set(true);
    }

    /** set to opened file */
    async open(saveName:string, data:{ [key: string]: unknown; }):Promise<boolean> {
        if (!data) {await this.reset(); return false;}
        await spinner('edition.open', 'Deserializing edition', this.deserialize(data));
        await this.saveName.set(saveName);
        
        // mark all as up to date
        await this.markClean();
        
        // THEN fix any ids that need it
        await this.fixDuplicateIds();

        return true;
    }

    /** reset to a blank edition */
    async reset():Promise<void> {
        await super.reset();
        await this.addNewCharacter();
        await this.markClean();
    }

    /** overriding to do a last-minute id uniqification */
    async serialize():Promise<{[key:string]:unknown}> {
        await this.fixDuplicateIds();
        return await super.serialize();
    }
}
