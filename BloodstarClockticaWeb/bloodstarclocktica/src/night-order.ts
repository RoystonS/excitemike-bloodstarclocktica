/**
 * code related to night order lists
 * @module NightOrder
 */
import {bindCollectionById, bindText, unbindElement} from './bind/bindings';
import {ObservableCollection, ObservableCollectionChangedEvent} from './bind/observable-collection';
import {PropKey} from './bind/observable-object';
import {Character} from './model/character';
import { Edition } from './model/edition';
import {ordinal, walkHTMLElements} from './util';

/** recurses though children of element cleaning up click events and bindings */
export function cleanupNightOrderItem(element: Node, _:Character): void {
    if (!(element instanceof HTMLElement)) {return;}
    walkHTMLElements(element, htmlElement=>{
        htmlElement.onclick = null;
        unbindElement(htmlElement);
    });
}

/** initialize listeners and data bindings */
function initNightOrderBinding(id:string, collection:ObservableCollection<Character>, ordinalPropName:string, reminderTextPropName:string):void {
    bindCollectionById(
        id,
        collection,
        (character, collection)=>makeNightOrderItem(character, collection, ordinalPropName),
        cleanupNightOrderItem
    );

    // update ordinals when list changes
    collection.addCollectionChangedListener((_:ObservableCollectionChangedEvent<Character>)=>{
        updateOrdinals(collection, ordinalPropName, reminderTextPropName);
    });
    collection.addItemChangedListener((_1:number, _2:Character, propName:PropKey) => {
        if ((propName === 'export') || (propName === reminderTextPropName)) {
            updateOrdinals(collection, ordinalPropName, reminderTextPropName);
        }
    });

    updateOrdinals(collection, ordinalPropName, reminderTextPropName);
}

/** initialize listeners and data bindings */
export function initNightOrderBindings(edition:Edition):void {
    initNightOrderBinding('firstNightOrderList', edition.getFirstNightOrder(), 'firstNightOrdinal', 'firstNightReminder');
    initNightOrderBinding('otherNightOrderList', edition.getOtherNightOrder(), 'otherNightOrdinal', 'otherNightReminder');
}

/**
 * create the HTMLElement for an item in the list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
export function makeNightOrderItem(character: Character, collection:ObservableCollection<Character>, ordinalPropertyName:string):HTMLElement {
    const row = document.createElement("div");
    row.className = "character-list-item";

    {
        const ordinal = document.createElement("label");
        ordinal.classList.add('ordinal');
        bindText(ordinal, character.getProperty(ordinalPropertyName));
        row.appendChild(ordinal);
    }

    {
        const nameElement = document.createElement("span");
        nameElement.className = "character-list-name";
        bindText(nameElement, character.getNameProperty());
        row.appendChild(nameElement);
    }

    {
        const up = document.createElement("button");
        up.className = "character-list-button";
        up.innerText = "▲";
        up.onclick = () => collection.moveItemUp(character);
        row.appendChild(up);
    }

    {
        const down = document.createElement("button");
        down.className = "character-list-button";
        down.innerText = "▼";
        down.onclick = () => collection.moveItemDown(character);
        row.appendChild(down);
    }

    return row;
}

/** keep ordinal fields up to date as things change */
function updateOrdinals(collection:ObservableCollection<Character>, ordinalPropName:string, reminderTextPropName:string):void {
    let ordNumber:number = 0;
    for (const character of collection) {
        const willExport = character.getExport();
        const hasReminder = !!character.getProperty(reminderTextPropName);
        if (willExport && hasReminder) {
            ordNumber++;
        }
        const place = hasReminder ? ordinal(ordNumber) : '-';
        const parenned = willExport ? `(${place})` : place;
        character.setPropertyValue(ordinalPropName, parenned);
    }
}