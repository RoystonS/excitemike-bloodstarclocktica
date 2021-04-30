/**
 * Model for edition data
 * @module Edition
 */
 import {Property} from '../bind/bindings';
 import {Character, CharacterSaveData} from './character';
 import {EditionAlmanac, EditionAlmanacSaveData} from './edition-almanac';
 import {EditionMeta, EditionMetaSaveData} from './edition-meta';
 import {ObservableCollection} from '../bind/observable-collection';
 import {ObservableObjectMixin} from '../bind/observable-object';

/** data to persist on the server for the edition */
export type EditionSaveData = {
    firstNightOrder:ReadonlyArray<string>,
    meta:EditionMetaSaveData,
    otherNightOrder:ReadonlyArray<string>,
    previewOnToken:boolean,
    characters:ReadonlyArray<CharacterSaveData>,
    almanac: EditionAlmanacSaveData
};

/** observable properties for a custom edition */
class _Edition {
    private almanac: EditionAlmanac;
    /** characters in the edition */
    private characterList: ObservableCollection<Character>;
    private dirty: Property<boolean>;
    /** contains the same Character objects as characterList, but ordered for night order */
    private firstNightOrder: ObservableCollection<Character>;
    private meta: EditionMeta;
    /** contains the same Character objects as characterList, but ordered for night order */
    private otherNightOrder: ObservableCollection<Character>;
    private previewOnToken: Property<boolean>;
    private saveName: Property<string>;
    private windowTitle: Property<string>;

    /** create new edition */
    constructor() {
        this.almanac = new EditionAlmanac();
        this.characterList = new ObservableCollection<Character>();
        this.dirty = new Property<boolean>(false);
        this.firstNightOrder = new ObservableCollection<Character>();
        this.meta = new EditionMeta();
        this.otherNightOrder = new ObservableCollection<Character>();
        this.previewOnToken = new Property<boolean>(true);
        this.saveName = new Property<string>('');
        this.windowTitle = new Property('Bloodstar Clocktica');
        this.addNewCharacter();

        // hook up auto-dirty
        const makeDirty = (_:any) => {
            this.dirty.set(true);
        };
        this.characterList.addCollectionChangedListener(makeDirty);
        this.characterList.addItemChangedListener(makeDirty);
        this.firstNightOrder.addCollectionChangedListener(makeDirty);
        this.firstNightOrder.addItemChangedListener(makeDirty);
        this.meta.addPropertyChangedEventListener(makeDirty);
        this.otherNightOrder.addCollectionChangedListener(makeDirty);
        this.otherNightOrder.addItemChangedListener(makeDirty);
        this.previewOnToken.addListener(makeDirty);
        this.saveName.addListener(makeDirty);

        // automatic title change on dirty
        const updateWindowTitle = ()=>this.windowTitle.set(`File: ${(this.dirty.get() ? '[unsaved changes] ' : '')}${this.saveName.get() || 'unnamed'}`);
        this.dirty.addListener(_=>updateWindowTitle());
        this.saveName.addListener(_=>updateWindowTitle());
    }

    /** add a new character to the set */
    addNewCharacter() {
        const character = new Character();
        this.makeNameAndIdUnique(character);
        this.characterList.add(character);
        this.firstNightOrder.add(character);
        this.otherNightOrder.add(character);
    }

    /** remove the specified character from the collectionlater in the order */
    deleteCharacter(character:Character):void {
        const i = this.characterList.indexOf(character);
        if (i < 0) { return; }
        this.characterList.remove(i);
    }

    getAuthorProperty():Property<string> { return this.meta.getAuthorProperty(); }
    getCharacterList() {
        return this.characterList;
    }
    getDirty():boolean { return this.dirty.get(); }
    getFirstNightOrder() {
        return this.firstNightOrder;
    }
    getOtherNightOrder() {
        return this.otherNightOrder;
    }
    getLogoProperty():Property<string|null> { return this.meta.getLogoProperty(); }
    getName():string { return this.meta.getName(); }
    getNameProperty():Property<string> { return this.meta.getNameProperty(); }

    /** get overview for binding */
    getOverviewProperty():Property<string> {
        return this.almanac.getOverviewProperty();
    }

    getPreviewOnTokenProperty():Property<boolean> { return this.previewOnToken; }

    /**
     * object to serialize as save file
     */ 
    getSaveData():EditionSaveData {
        const firstNightOrderSaveData:string[] = this.firstNightOrder.map(c=>c.getId());
        const otherNightOrderSaveData:string[] = this.otherNightOrder.map(c=>c.getId());
        const charactersSaveData:CharacterSaveData[] = this.characterList.map(c=>c.getSaveData());
        return {
            firstNightOrder:firstNightOrderSaveData,
            meta: this.meta.getSaveData(),
            otherNightOrder:otherNightOrderSaveData,
            previewOnToken:this.previewOnToken.get(),
            characters:charactersSaveData,
            almanac: this.almanac.getSaveData(),
        };
    }

    /**
     * get name to save as
     */
    getSaveName():string { return this.saveName.get(); }

    /** get synopsis for binding */
    getSynopsisProperty():Property<string> {
        return this.almanac.getSynopsisProperty();
    }

    getWindowTitleProperty():Property<string> { return this.windowTitle; }

    /** make sure the name and id of a newly added character aren't taken */
    makeNameAndIdUnique(character:Character):void {
        let i = 1;
        const originalId = character.getId();
        const originalName = character.getName();
        let matchFound;
        do {
            matchFound = false;
            for (const existingCharacter of this.characterList) {
                if ((existingCharacter.getId() === character.getId()) || (existingCharacter.getName() === character.getName())) {
                    matchFound = true;
                    character.setId(originalId + i);
                    character.setName(originalName + i);
                    i++;
                    break;
                }
            }
        } while (matchFound);
    }

    /** move the specified character later in the order */
    moveCharacterDown(character:Character):void {
        const i = this.characterList.indexOf(character);
        if (i < 0) { return; }
        this.characterList.move(i, i+1);
    }

    /** move the specified character earlier in the order */
    moveCharacterUp(character:Character):void {
        const i = this.characterList.indexOf(character);
        if (i < 1) { return; }
        this.characterList.move(i, i-1);
    }

    /**
     * set to opened file
     * @param data 
     */
     open(saveName:string, data:EditionSaveData):boolean {
        this.saveName.set(saveName);
        this.almanac.open(data.almanac);
        
        this.meta.open(data.meta);
        
        this.characterList.set(data.characters.map(characterSaveData=>Character.from(characterSaveData)));

        const charactersById = new Map<string, Character>();
        {
            for (const character of this.characterList) {
                charactersById.set(character.getId(), character);
            }
        }

        this.firstNightOrder.set(data.firstNightOrder.map(id=>charactersById.get(id) || new Character()));
        this.otherNightOrder.set(data.otherNightOrder.map(id=>charactersById.get(id) || new Character()));

        this.dirty.set(false);

        return true;
    }

    /** reset to a blank edition */
    reset() {
        this.almanac.reset();
        this.saveName.set('');
        this.previewOnToken.set(true);
        this.meta.reset('New Edition');
        this.windowTitle.set('Bloodstar Clocktica');

        this.characterList.clear();
        this.firstNightOrder.clear();
        this.otherNightOrder.clear();
        this.addNewCharacter();

        this.dirty.set(false);
    }

    setDirty(value:boolean):void {this.dirty.set(value); }

    /**
     * set name to save as
     */
    setSaveName(value:string):void { this.saveName.set(value); }
}

/** observable properties for a custom edition */
export const Edition = ObservableObjectMixin(_Edition);
export type Edition = InstanceType<ReturnType<typeof ObservableObjectMixin>> & _Edition;