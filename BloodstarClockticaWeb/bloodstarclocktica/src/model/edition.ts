/**
 * Model for edition data
 * @module Edition
 */
 import {Property} from '../bind/bindings';
 import {Character, CharacterSaveData} from './character';
 import {EditionAlmanac, EditionAlmanacSaveData} from './edition-almanac';
 import {EditionMeta, EditionMetaSaveData} from './edition-meta';
 import {ObservableCollection} from '../bind/observable-collection';
 import {observableChild, observableCollection, ObservableObject, observableProperty} from '../bind/observable-object';

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
export class Edition extends ObservableObject {
    /** almanac-specific edition data */
    @observableChild
    private almanac = new EditionAlmanac();

    /** characters in the edition */
    @observableCollection
    private characterList = new ObservableCollection<Character>();

    /** true when there are unsaved changes */
    @observableProperty
    private dirty = new Property<boolean>(false);

    /** contains the same Character objects as characterList, but ordered for night order */
    @observableCollection
    private firstNightOrder = new ObservableCollection<Character>();

    /** data about the edition */
    @observableChild
    private meta = new EditionMeta();

    /** contains the same Character objects as characterList, but ordered for night order */
    @observableCollection
    private otherNightOrder = new ObservableCollection<Character>();
    
    /** whether to render preview on a character token background like you would see on clocktower.online */
    @observableProperty
    private previewOnToken = new Property<boolean>(true);

    /** name to use when saving */
    @observableProperty
    private saveName = new Property<string>('');

    /** what to show as the current file and its status */
    @observableProperty
    private windowTitle = new Property<string>('Bloodstar Clocktica');

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
    addNewCharacter() {
        const character = new Character();
        this.makeNameAndIdUnique(character);
        this.characterList.add(character);
        this.firstNightOrder.add(character);
        this.otherNightOrder.add(character);
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

    /** set to opened file */
    open(saveName:string, data:EditionSaveData):boolean {
        if (!data) {this.reset(); return false;}
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

        this.firstNightOrder.set(data.firstNightOrder.filter(id=>charactersById.has(id)).map(id=>charactersById.get(id) || new Character()));
        this.otherNightOrder.set(data.otherNightOrder.filter(id=>charactersById.has(id)).map(id=>charactersById.get(id) || new Character()));

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
