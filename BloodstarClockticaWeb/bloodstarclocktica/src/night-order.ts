/**
 * code related to night order lists
 * @module NightOrder
 */
import {bindCollectionById, bindEnumDisplay, bindText, bindStyle, unbindElement} from './bind/bindings';
import {ObservableCollection, ObservableCollectionChangedEvent} from './bind/observable-collection';
import {PropKey} from './bind/observable-object';
import { BloodTeam } from './model/blood-team';
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
        (character, collection)=>makeNightOrderItem(character, collection, ordinalPropName, reminderTextPropName),
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
export function makeNightOrderItem(character: Character, collection:ObservableCollection<Character>, ordinalPropertyName:string, reminderPropertyName:string):HTMLElement {
    const row = document.createElement("div");
    row.className = "nightOrderItem";

    {
        const ordinal = document.createElement("span");
        ordinal.classList.add('ordinal');
        bindText(ordinal, character.getProperty(ordinalPropertyName));
        bindStyle<boolean>(ordinal, character.getExportProperty(), (willExport:boolean, classList:DOMTokenList)=>{
            if (willExport) {
                classList.remove('dim');
            } else {
                classList.add('dim');
            }
        });
        row.appendChild(ordinal);
    }

    {
        const nameElement = document.createElement("span");
        nameElement.className = "nightOrderName";
        bindText(nameElement, character.getNameProperty());
        row.appendChild(nameElement);
    }

    {
        const teamSizer = document.createElement("div");
        teamSizer.className = "nightOrderTeamSizer";
        row.appendChild(teamSizer);

        const teamColor = document.createElement('div');
        teamColor.className = "nightOrderTeamColor";
        bindStyle<BloodTeam>(teamColor, character.getTeamProperty(), setTeamColorStyle);
        teamSizer.appendChild(teamColor);

        const teamElement = document.createElement("div");
        teamElement.className = "nightOrderTeamText";
        bindEnumDisplay(teamElement, character.getTeamProperty());
        teamColor.appendChild(teamElement);
    }

    {
        const reminderElement = document.createElement("span");
        reminderElement.className = "nightOrderReminder";
        bindText(reminderElement, character.getProperty(reminderPropertyName));
        row.appendChild(reminderElement);
    }

    {
        const up = document.createElement("button");
        up.className = "nightOrderButton";
        up.innerText = "▲";
        up.onclick = () => collection.moveItemUp(character);
        row.appendChild(up);
    }

    {
        const down = document.createElement("button");
        down.className = "nightOrderButton";
        down.innerText = "▼";
        down.onclick = () => collection.moveItemDown(character);
        row.appendChild(down);
    }

    return row;
}

/** keep ordinal fields up to date as things change */
function updateOrdinals(collection:ObservableCollection<Character>, ordinalPropName:string, reminderTextPropName:string):void {
    // set ordinal strings
    {
        let ordNumber:number = 1;
        for (const character of collection) {
            const willExport = character.getExport();
            const x = character.getProperty(reminderTextPropName).get();
            const y = !x;
            const hasReminder = !y;

            const place = hasReminder ? ordinal(ordNumber) : '-';
            const parenned = willExport ? place : `(${place})`;
            character.setPropertyValue(ordinalPropName, parenned);
            
            if (willExport && hasReminder) {
                ordNumber++;
            }
        }
    }
}

/** map teams to css classes */
const teamColorStyleMap = new Map<BloodTeam, string>([
    [BloodTeam.TOWNSFOLK, 'teamColorTownsfolk'],
    [BloodTeam.OUTSIDER, 'teamColorOutsider'],
    [BloodTeam.MINION, 'teamColorMinion'],
    [BloodTeam.DEMON, 'teamColorDemon'],
    [BloodTeam.TRAVELER, 'teamColorTraveler'],
]);

/** sync team color style to the actual team */
function setTeamColorStyle(actualTeam:BloodTeam, classList:DOMTokenList):void{
    for (const [team, style] of teamColorStyleMap) {
        if (actualTeam === team) {
            classList.add(style);
        } else {
            classList.remove(style);
        }
    }
}