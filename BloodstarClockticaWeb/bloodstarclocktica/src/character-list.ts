import { bindCheckbox, bindCollectionById, bindText, Property, PropertyChangeListener, unbindElement } from "./bind/bindings";
import { ObservableCollection, ObservableCollectionChangedEvent } from "./bind/observable-collection";
import { Character } from "./model/character";
import { walkHTMLElements } from "./util";

/** need to track the listeners we add so that we can remove them */
const characterListCleanupSideTable = new Map<HTMLElement, PropertyChangeListener<Character|null>>();

/** setup bindings for character list */
export function bindCharacterList(id:string, characterList:ObservableCollection<Character>, selectedCharacterProperty:Property<Character|null>):void {
    bindCollectionById(
        id,
        characterList,
        (character: Character, collection:ObservableCollection<Character>)=>makeCharacterListItem(character, collection, selectedCharacterProperty),
        (element: Node, character: Character)=>cleanupListItem(element, character, selectedCharacterProperty)
    );
    // autoselect a character when none selected
    characterList.addCollectionChangedListener((_:ObservableCollectionChangedEvent<Character>):void=>{
        if (null === selectedCharacterProperty.get()) {
            if (characterList.getLength() > 0) {
                selectedCharacterProperty.set(characterList.get(0));
            }
        }
    });
}

/** recurses though children of element cleaning up click events and bindings */
function cleanupListItem(element: Node, character: Character, selectedCharacterProperty:Property<Character|null>): void {
    if (selectedCharacterProperty.get() === character) {
        selectedCharacterProperty.set(null);
    }

    if (element instanceof HTMLElement) {
        walkHTMLElements(element, htmlElement=>{
            htmlElement.onclick = null;
            unbindElement(htmlElement);
        });

        // cleanup listener from makeCharacterListItem
        {
            const cb = characterListCleanupSideTable.get(element);
            if (cb) {
                selectedCharacterProperty.removeListener(cb);
            }
            characterListCleanupSideTable.delete(element);
        }
    }
}

/**
 * create the HTMLElement for an item in the character list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
function makeCharacterListItem(character: Character, collection:ObservableCollection<Character>, selectedCharacterProperty:Property<Character|null>):HTMLElement {
    const row = document.createElement("div");
    row.className = "characterListItem";
    row.tabIndex = 0;
    row.onclick = e => { 
        if (e.target === row) {
            selectedCharacterProperty.set(character);
        }
    }
    row.onkeyup = e => {
        switch (e.code) {
            case 'Space':
            case 'Enter':
                selectedCharacterProperty.set(character);
                break;
        }
    }

    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        bindCheckbox(checkbox, character.export);
        row.appendChild(checkbox);
    }

    {
        const nameElement = document.createElement("span");
        nameElement.className = "characterListName";
        bindText(nameElement, character.name);
        row.appendChild(nameElement);
    }

    {
        const up = document.createElement("button");
        up.className = "characterListButton";
        up.innerText = "▲";
        up.onclick = () => collection.moveItemUp(character);
        row.appendChild(up);
    }

    {
        const down = document.createElement("button");
        down.className = "characterListButton";
        down.innerText = "▼";
        down.onclick = () => collection.moveItemDown(character);
        row.appendChild(down);
    }

    {
        const del = document.createElement("button");
        del.className = "characterListButton";
        del.innerText = "Delete";
        // TODO: confirm delete
        del.onclick = () => collection.deleteItem(character);
        row.appendChild(del);
    }

    const cb = (selectedCharacter:Character|null):void => {
        if (selectedCharacter === character) {
            row.classList.add('characterListItemSelected');
        } else {
            row.classList.remove('characterListItemSelected');
        }
    };
    selectedCharacterProperty.addListener(cb);
    characterListCleanupSideTable.set(row, cb);

    return row;
};