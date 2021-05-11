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
        if (!(character instanceof Character)) {return;}
        charactersById.set(character.id.get(), character);
    }
    await nightOrder.set(data.filter(id=>charactersById.has(String(id))).map(id=>{
        const character = charactersById.get(String(id));
        if (!character) {throw new Error('Failed to get character by id when setting night order')}
        return character;
    }));
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
    readonly dirtySourceImages = new Set<string>();

    /** final images that need to be saved */
    readonly dirtyFinalImages = new Set<string>();

    // TODO: logo dirtiness

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
                case 'unStyledImage':
                    edition.dirtySourceImages.add(character.id.get());
                    break;
                case 'styledImage':
                    edition.dirtyFinalImages.add(character.id.get());
                    break;
            }
        });
        edition.characterList.addCollectionChangedListener(event=>{
            switch (event.action) {
                case ObservableCollectionChangeAction.Remove:
                case ObservableCollectionChangeAction.Replace:
                    for (const character of event.oldItems) {
                        const id = character.id.get();
                        edition.dirtySourceImages.delete(id);
                        edition.dirtyFinalImages.delete(id);
                    }
                    break;
            }
        });

        return edition
    }

    /** add a new character to the set */
    async addNewCharacter():Promise<Character> {
        const character = await Character.asyncNew();
        await this.makeNameAndIdUnique(character);
        await this.characterList.add(character);
        await this.firstNightOrder.add(character);
        await this.otherNightOrder.add(character);
        return character;
    }

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

    /** set to opened file */
    async open(saveName:string, data:{ [key: string]: unknown; }):Promise<boolean> {
        if (!data) {await this.reset(); return false;}
        await spinner('edition.open', 'Deserializing edition', this.deserialize(data));
        await this.saveName.set(saveName);
        
        // mark all as up to date
        this.dirtySourceImages.clear();
        this.dirtyFinalImages.clear();
        await this.dirty.set(false);

        return true;
    }

    /** reset to a blank edition */
    async reset():Promise<void> {
        await super.reset();
        this.dirtySourceImages.clear();
        this.dirtyFinalImages.clear();
        await this.addNewCharacter();
        await this.dirty.set(false);
    }
}
