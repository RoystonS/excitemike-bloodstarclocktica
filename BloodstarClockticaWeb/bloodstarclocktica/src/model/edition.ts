/**
 * Model for edition data
 * @module Edition
 */
import {Property} from '../bind/bindings';
import {spinner} from '../dlg/spinner-dlg';
import {Character} from './character';
import {EditionAlmanac} from './edition-almanac';
import {EditionMeta} from './edition-meta';
import {ObservableCollection} from '../bind/observable-collection';
import {observableChild, observableCollection, ObservableObject, observableProperty, ObservableType} from '../bind/observable-object';

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
        await this.dirty.set(false);

        return true;
    }

    /** reset to a blank edition */
    async reset():Promise<void> {
        await super.reset();
        await this.addNewCharacter();
        await this.dirty.set(false);
    }
}
