/**
 * code related to night order lists
 * @module NightOrder
 */
import {bindAttribute, bindCollectionById, bindImageDisplay, bindStyle, bindText, Property, unbindElement} from './bind/bindings';
import {ObservableCollection} from './bind/observable-collection';
import {PropKey} from './bind/observable-object';
import { BloodTeam } from './model/blood-team';
import {Character} from './model/character';
import { Edition } from './model/edition';
import { setTeamColorStyle } from './team-color';
import {createElement, getOrdinalString, walkHTMLElements} from './util';
import { tabClicked } from "./bloodstar";

/** recurses though children of element cleaning up click events and bindings */
export function cleanupNightOrderItem(element: Node): void {
    if (!(element instanceof HTMLElement)) {return;}
    walkHTMLElements(element, htmlElement=>{
        htmlElement.onclick = null;
        unbindElement(htmlElement);
    });
}

/** initialize listeners and data bindings */
async function initNightOrderBinding(
    id:string, collection:ObservableCollection<Character>,
    ordinalPropName:'firstNightOrdinal'|'otherNightOrdinal',
    reminderTextPropName:'firstNightReminder'|'otherNightReminder',
    selectedCharacterProperty:Property<Character|null>
):Promise<void> {
    bindCollectionById(
        id,
        collection,
        (char, coll)=>makeNightOrderItem(char, coll, ordinalPropName, reminderTextPropName),
        cleanupNightOrderItem,
        {
            buttonStyle:'nightOrderButton',
            editBtnCb:async (character:Character)=>{
                await selectedCharacterProperty.set(character);
                tabClicked('charTabBtn', 'charactertab');
            },
            showDeleteBtn:false,
            showEditBtn:true
        }
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
export async function initNightOrderBindings(edition:Edition, selectedCharacterProperty:Property<Character|null>):Promise<void> {
    await initNightOrderBinding('firstNightOrderList', edition.firstNightOrder, 'firstNightOrdinal', 'firstNightReminder', selectedCharacterProperty);
    await initNightOrderBinding('otherNightOrderList', edition.otherNightOrder, 'otherNightOrdinal', 'otherNightReminder', selectedCharacterProperty);
}

/**
 * create the HTMLElement for an item in the list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
export function makeNightOrderItem(
    character: Character,
    _collection:ObservableCollection<Character>,
    ordinalPropertyName:'firstNightOrdinal'|'otherNightOrdinal',
    reminderPropertyName:'firstNightReminder'|'otherNightReminder'
):HTMLElement {
    const row = createElement({t:'div', css:['nightOrderItem']});
    bindStyle<BloodTeam>(row, character.team, setTeamColorStyle);
    bindAttribute(row, 'title', character.getProperty<string>(reminderPropertyName));

    const ordinal = createElement({t:'span', css:['ordinal']});
    bindText(ordinal, character.getProperty(ordinalPropertyName));
    bindStyle<boolean>(ordinal, character.export, (willExport:boolean, classList:DOMTokenList)=>{
        if (willExport) {
            classList.remove('dim');
        } else {
            classList.add('dim');
        }
    });
    row.appendChild(ordinal);

    const icon = createElement({t:'img', css:['nightOrderThumbnail']});
    bindImageDisplay(icon, character.styledImage);
    row.appendChild(icon);

    const nameElement = createElement({t:'span', css:['nightOrderName', 'nowrap']});
    bindText(nameElement, character.name);
    row.appendChild(nameElement);

    const reminderElement = createElement({t:'span', css:['nightOrderReminder', 'nowrap']});
    bindText(reminderElement, character.getProperty(reminderPropertyName));
    row.appendChild(reminderElement);

    return row;
}

/** keep ordinal fields up to date as things change */
async function updateOrdinals(
    collection:ObservableCollection<Character>,
    ordinalPropName:'firstNightOrdinal'|'otherNightOrdinal',
    reminderTextPropName:'firstNightReminder'|'otherNightReminder'
):Promise<void> {
    // set ordinal strings
    let ordNumber = 1;
    for (const character of collection) {
        const willExport = character.export.get();
        const x = character.getProperty(reminderTextPropName).get();
        const y = !x;
        const hasReminder = !y;

        const place = hasReminder ? getOrdinalString(ordNumber) : '-';
        const parenned = willExport ? place : `(${place})`;
        await character.setPropertyValue(ordinalPropName, parenned);

        if (willExport && hasReminder) {
            ordNumber++;
        }
    }
}