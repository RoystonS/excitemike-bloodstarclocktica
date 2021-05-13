/**
 * code related to night order lists
 * @module NightOrder
 */
import {bindCollectionById, bindText, bindStyle, unbindElement, Property} from './bind/bindings';
import {ObservableCollection} from './bind/observable-collection';
import {PropKey} from './bind/observable-object';
import { BloodTeam } from './model/blood-team';
import {Character} from './model/character';
import { Edition } from './model/edition';
import {ordinal, walkHTMLElements} from './util';

/** recurses though children of element cleaning up click events and bindings */
export function cleanupNightOrderItem(element: Node): void {
    if (!(element instanceof HTMLElement)) {return;}
    walkHTMLElements(element, htmlElement=>{
        htmlElement.onclick = null;
        unbindElement(htmlElement);
    });
}

/** initialize listeners and data bindings */
async function initNightOrderBinding(id:string, collection:ObservableCollection<Character>, ordinalPropName:'firstNightOrdinal'|'otherNightOrdinal', reminderTextPropName:'firstNightReminder'|'otherNightReminder'):Promise<void> {
    bindCollectionById(
        id,
        collection,
        (character, collection)=>makeNightOrderItem(character, collection, ordinalPropName, reminderTextPropName),
        cleanupNightOrderItem
    );

    // update ordinals when list changes
    collection.addCollectionChangedListener(async ()=>{
        await updateOrdinals(collection, ordinalPropName, reminderTextPropName);
    });
    collection.addItemChangedListener(async (_1:number, _2:Character, propName:PropKey<Character>) => {
        if ((propName === 'export') || (propName === reminderTextPropName)) {
            await updateOrdinals(collection, ordinalPropName, reminderTextPropName);
        }
    });

    await updateOrdinals(collection, ordinalPropName, reminderTextPropName);
}

/** initialize listeners and data bindings */
export async function initNightOrderBindings(edition:Edition):Promise<void> {
    await initNightOrderBinding('firstNightOrderList', edition.firstNightOrder, 'firstNightOrdinal', 'firstNightReminder');
    await initNightOrderBinding('otherNightOrderList', edition.otherNightOrder, 'otherNightOrdinal', 'otherNightReminder');
}

/**
 * create the HTMLElement for an item in the list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
export function makeNightOrderItem(character: Character, collection:ObservableCollection<Character>, ordinalPropertyName:'firstNightOrdinal'|'otherNightOrdinal', reminderPropertyName:'firstNightReminder'|'otherNightReminder'):HTMLElement {
    const row = document.createElement("div");
    {
        row.className = "nightOrderItem";
        bindStyle<BloodTeam>(row, character.team, setTeamColorStyle);
    }

    // TODO: character icon
    // TODO: reminder as tooltip
    // TODO: no wordwrap
    // TODO: shrink instead of alpha out on drag
    // TODO: grow when dropped or drag cancelled

    {
        const ordinal = document.createElement("span");
        ordinal.classList.add('ordinal');
        bindText(ordinal, character.getProperty(ordinalPropertyName) as Property<string>);
        bindStyle<boolean>(ordinal, character.export, (willExport:boolean, classList:DOMTokenList)=>{
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
        bindText(nameElement, character.name);
        row.appendChild(nameElement);
    }

    {
        const reminderElement = document.createElement("span");
        reminderElement.className = "nightOrderReminder";
        bindText(reminderElement, character.getProperty(reminderPropertyName) as Property<string>);
        row.appendChild(reminderElement);
    }

    {
        const up = document.createElement("button");
        up.className = "nightOrderButton";
        up.innerText = "▲";
        up.onclick = async () => await collection.moveItemUp(character);
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
async function updateOrdinals(collection:ObservableCollection<Character>, ordinalPropName:'firstNightOrdinal'|'otherNightOrdinal', reminderTextPropName:'firstNightReminder'|'otherNightReminder'):Promise<void> {
    // set ordinal strings
    {
        let ordNumber = 1;
        for (const character of collection) {
            const willExport = character.export.get();
            const x = character.getProperty(reminderTextPropName).get();
            const y = !x;
            const hasReminder = !y;

            const place = hasReminder ? ordinal(ordNumber) : '-';
            const parenned = willExport ? place : `(${place})`;
            await character.setPropertyValue(ordinalPropName, parenned);
            
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
    [BloodTeam.FABLED, 'teamColorFabled'],
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