/**
 * Model for edition data
 * @module Edition
 */
import {FieldType, Property} from '../bind/bindings';
import {Character} from './character';
import {EditionAlmanac} from './edition-almanac';
import {EditionMeta} from './edition-meta';
import {ObservableCollection} from '../bind/observable-collection';
import {customSerialize, observableChild, observableCollection, ObservableObject, observableProperty, ObservableType} from '../bind/observable-object';

function serializeJustIds(_:ObservableObject<any>, nightOrder:ObservableType):FieldType {
    if (!(nightOrder instanceof ObservableCollection)) {return [];}
    return nightOrder.map((c:Character)=>c.id.get())
}
function deserializeFromIds(object:ObservableObject<any>, nightOrder:ObservableType, data:FieldType):void {
    if (!(nightOrder instanceof ObservableCollection)) {return;}
    if (!Array.isArray(data)){return;}
    const characterList = object.getCollection('characterList');
    if (!(characterList instanceof ObservableCollection)) {return;}

    const charactersById = new Map<string, Character>();
    for (const character of characterList) {
        if (!(character instanceof Character)) {return;}
        charactersById.set(character.id.get(), character);
    }
    nightOrder.set(data.filter(id=>charactersById.has(String(id))).map(id=>charactersById.get(String(id)) || new Character()));
}

/** observable properties for a custom edition */
export class Edition extends ObservableObject<Edition> {
    /** almanac-specific edition data */
    @observableChild()
    readonly almanac = new EditionAlmanac();

    /** characters in the edition */
    @observableCollection()
    readonly characterList = new ObservableCollection(Character);

    /** true when there are unsaved changes */
    @observableProperty()
    readonly dirty = new Property<boolean>(false);

    /** contains the same Character objects as characterList, but ordered for night order */
    @customSerialize(serializeJustIds, deserializeFromIds)
    @observableCollection()
    readonly firstNightOrder = new ObservableCollection(Character);

    /** data about the edition */
    @observableChild()
    readonly meta = new EditionMeta();

    /** contains the same Character objects as characterList, but ordered for night order */
    @customSerialize(serializeJustIds, deserializeFromIds)
    @observableCollection()
    readonly otherNightOrder = new ObservableCollection(Character);
    
    /** whether to render preview on a character token background like you would see on clocktower.online */
    @observableProperty()
    readonly previewOnToken = new Property<boolean>(true);

    /** name to use when saving */
    @observableProperty()
    readonly saveName = new Property<string>('');

    /** what to show as the current file and its status */
    @observableProperty()
    readonly windowTitle = new Property<string>('Bloodstar Clocktica');

    /** create new edition */
    constructor() {
        super();
        this.init();
        this.addNewCharacter();

        // set dirty flag when most things change and update window title when dirty or savename change
        this.addPropertyChangedEventListener(propName=>{
            switch (propName) {
                case 'dirty':
                case 'saveName':
                    this.windowTitle.set(`File: ${(this.dirty.get() ? '[unsaved changes] ' : '')}${this.saveName.get() || '[unnamed]'}`);
                    break;
                case 'windowTitle':
                    break;
                default:
                    this.dirty.set(true);
                    break;
            }
        });
    }

    /** add a new character to the set */
    addNewCharacter():Character {
        const character = new Character();
        this.makeNameAndIdUnique(character);
        this.characterList.add(character);
        this.firstNightOrder.add(character);
        this.otherNightOrder.add(character);
        return character;
    }

    /** make sure the name and id of a newly added character aren't taken */
    makeNameAndIdUnique(character:Character):void {
        let i = 1;
        const originalId = character.id.get();
        const originalName = character.name.get();
        let matchFound;
        do {
            matchFound = false;
            for (const existingCharacter of this.characterList) {
                if ((existingCharacter.id.get() === character.id.get()) || (existingCharacter.name.get() === character.name.get())) {
                    matchFound = true;
                    character.id.set(originalId + i);
                    character.name.set(originalName + i);
                    i++;
                    break;
                }
            }
        } while (matchFound);
    }

    /** set to opened file */
    open(saveName:string, data:{ [key: string]: FieldType; }):boolean {
        if (!data) {this.reset(); return false;}
        this.deserialize(data);
        this.setSaveName(saveName);
        this.dirty.set(false);

        return true;
    }

    /** reset to a blank edition */
    reset() {
        super.reset();
        this.addNewCharacter();
        this.dirty.set(false);
    }

    /** record whether there are unsaved changes */
    setDirty(value:boolean):void {this.dirty.set(value); }

    /** set name to save as */
    setSaveName(value:string):void { this.saveName.set(value); }
}
