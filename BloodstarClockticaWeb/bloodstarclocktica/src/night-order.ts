/**
 * code related to night order lists
 * @module NightOrder
 */
import {bindCheckbox, bindText, unbindElement} from './bind/bindings';
import {ObservableCollection} from './bind/observable-collection';
import {Character} from './model/character';
import {walkHTMLElements} from './util';

/**
 * create the HTMLElement for an item in the list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
export function makeNightOrderItem(character: Character, collection:ObservableCollection<Character>):HTMLElement {
    const row = document.createElement("div");
    row.className = "character-list-item";

    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        bindCheckbox(checkbox, character.getExportProperty());
        row.appendChild(checkbox);
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

/** recurses though children of element cleaning up click events and bindings */
export function cleanupNightOrderItem(element: Node, _:Character): void {
    if (!(element instanceof HTMLElement)) {return;}
    walkHTMLElements(element, htmlElement=>{
        htmlElement.onclick = null;
        unbindElement(htmlElement);
    });
}