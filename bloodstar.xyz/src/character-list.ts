import { bindAttribute, bindCheckbox, bindCollectionById, bindImageDisplay, bindStyle, bindText, Property, PropertyChangeListener, unbindElement } from "./bind/bindings";
import { ObservableCollection } from "./bind/observable-collection";
import { showError } from "./dlg/blood-message-dlg";
import {show as getConfirmation} from "./dlg/yes-no-dlg";
import { BloodTeam } from "./model/blood-team";
import { Character } from "./model/character";
import { setTeamColorStyle } from "./team-color";
import { createElement, walkHTMLElements } from "./util";

/** need to track the listeners we add so that we can remove them */
const characterListCleanupSideTable = new Map<HTMLElement, PropertyChangeListener<Character|null>>();

/** setup bindings for character list */
export function bindCharacterList(id:string, characterList:ObservableCollection<Character>, selectedCharacterProperty:Property<Character|null>):void {
    bindCollectionById(
        id,
        characterList,
        (character: Character, collection:ObservableCollection<Character>)=>makeCharacterListItem(character, collection, selectedCharacterProperty),
        async (element: Node, character: Character)=>await cleanupListItem(element, character, selectedCharacterProperty)
    );
    // autoselect a character when none selected
    characterList.addCollectionChangedListener(async ():Promise<void>=>{
        if (null === selectedCharacterProperty.get()) {
            if (characterList.getLength() > 0) {
                await selectedCharacterProperty.set(characterList.get(0));
            }
        }
    });
}

/** recurses though children of element cleaning up click events and bindings */
async function cleanupListItem(element: Node, character: Character, selectedCharacterProperty:Property<Character|null>):Promise<void> {
    if (selectedCharacterProperty.get() === character) {
        await selectedCharacterProperty.set(null);
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
    {
        row.className = "characterListItem";
        row.tabIndex = 0;
        row.onclick = async e => { 
            if (e.target === row) {
                await selectedCharacterProperty.set(character);
            }
        }
        row.onkeyup = async e => {
            switch (e.code) {
                case 'Space':
                case 'Enter':
                case 'NumpadEnter':
                    await selectedCharacterProperty.set(character);
                    break;
            }
        }
        bindStyle<BloodTeam>(row, character.team, setTeamColorStyle);
        bindAttribute(row, 'title', character.ability);
    }

    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        bindCheckbox(checkbox, character.export);
        row.appendChild(checkbox);
    }

    {
        const icon = createElement({t:'img',css:['characterListThumbnail']});
        bindImageDisplay(icon, character.styledImage);
        row.appendChild(icon);
    }

    {
        const nameElement = createElement({t:'span',css:['characterListName','nowrap']});
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
        del.onclick = async () => {
            try {
                if (await getConfirmation('Confirm Delete', `Are you sure you want to delete character "${character.name.get()}"?`)) {
                    await collection.deleteItem(character);
                }
            } catch (e) {
                await showError('Error', 'Error encountered during deletion', e);
            }
        };
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
}