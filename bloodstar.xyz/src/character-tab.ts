/**
 * code for character tab
 * @module CharacterTab
 */
import {bindCheckboxById, bindComboBoxById, bindImageChooserById, bindImageDisplayById, bindSliderById, bindStyleById, bindTextById, bindVisibilityById, EnumProperty, Property, unbindElementById} from './bind/bindings';
import {showError} from "./dlg/blood-message-dlg";
import { ProcessImageSettings } from './blood-image';
import { BloodTeam, parseBloodTeam } from './model/blood-team';
import { Character } from './model/character';
import {hookupClickEvents} from './util';

/** helper type for disableCharacterTab */
type TagsThatCanBeDisabled = "button" | "fieldset" | "input" | "optgroup" | "option" | "select" | "textarea";

/** set up character tab bindings */
function bindCharacterTabControls(character:Character):(()=>void)|null {
    const characterTabIds:Set<string> = new Set<string>();
    bindTrackedText('characterId', character.id, characterTabIds);
    bindTrackedText('characterName', character.name, characterTabIds);
    bindTrackedComboBox('characterTeam', character.team, characterTabIds, parseBloodTeam, x=>x);
    bindTrackedStyle<BloodTeam>('characterTeam', character.team, setTeamColorStyle, characterTabIds);
    bindTrackedText('characterAbility', character.ability, characterTabIds);
    bindTrackedText('characterFirstNightReminder', character.firstNightReminder, characterTabIds);
    bindTrackedText('characterOtherNightReminder', character.otherNightReminder, characterTabIds);
    bindTrackedCheckBox('characterSetup', character.setup, characterTabIds);
    bindTrackedText('characterReminderTokens', character.characterReminderTokens, characterTabIds);
    bindTrackedText('globalReminderTokens', character.globalReminderTokens, characterTabIds);
    bindTrackedCheckBox('characterExport', character.export, characterTabIds);
    bindTrackedText('characterNotes', character.notes, characterTabIds);
    bindTrackedText('characterAttribution', character.attribution, characterTabIds);
    bindTrackedText('characterAlmanacFlavor', character.almanac.flavor, characterTabIds);
    bindTrackedText('characterAlmanacOverview', character.almanac.overview, characterTabIds);
    bindTrackedText('characterAlmanacExamples', character.almanac.examples, characterTabIds);
    bindTrackedText('characterAlmanacHowToRun', character.almanac.howToRun, characterTabIds);
    bindTrackedText('characterAlmanacTip', character.almanac.tip, characterTabIds);
    bindTrackedImageChooser('characterUnstyledImageInput', character.unStyledImage, characterTabIds);
    bindTrackedVisibility('characterImagePreviewSpinner', character.isLoading, characterTabIds);
    bindTrackedImageDisplay('characterStyledImageDisplay', character.styledImage, characterTabIds);

    bindTrackedText('curvedCharacterNameTextPath', character.name, characterTabIds);

    const sliderHelper = (id:string, p:Property<number>) => {
        bindTrackedSlider(id, `${id}ValueLabel`, p, characterTabIds);
    };

    bindTrackedCheckBox('shouldRestyle', character.imageSettings.shouldRestyle, characterTabIds);
    sliderHelper('horizontalPlacement', character.imageSettings.horizontalPlacement);
    sliderHelper('verticalPlacement', character.imageSettings.verticalPlacement);
    sliderHelper('sizeFactor', character.imageSettings.sizeFactor);
    bindTrackedCheckBox('shouldCrop', character.imageSettings.shouldCrop, characterTabIds);
    bindTrackedCheckBox('shouldColorize', character.imageSettings.shouldColorize, characterTabIds);
    bindTrackedCheckBox('useOutsiderAndMinionColors', character.imageSettings.useOutsiderAndMinionColors, characterTabIds);
    bindTrackedCheckBox('useTexture', character.imageSettings.useTexture, characterTabIds);
    bindTrackedCheckBox('useBorder', character.imageSettings.useBorder, characterTabIds);
    sliderHelper('borderIntensity', character.imageSettings.borderIntensity);
    bindTrackedCheckBox('dropShadow', character.imageSettings.useDropshadow, characterTabIds);
    sliderHelper('dropShadowSize', character.imageSettings.dropShadowSize);
    sliderHelper('dropShadowOffsetX', character.imageSettings.dropShadowOffsetX);
    sliderHelper('dropShadowOffsetY', character.imageSettings.dropShadowOffsetY);
    sliderHelper('dropShadowOpacity', character.imageSettings.dropShadowOpacity);

    const unhookupClickEvents = hookupClickEvents([
        ['characterImageRemoveBtn', ()=>character.unStyledImage.set(null)],
        ['resetImageSettings', ()=>character.imageSettings.reset()]
    ]);

    if (unbindCharacterTabControls) {
        const message = 'binding character tab controls without clearing previous bindings';
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        showError('Programmer Error', message, new Error(message));
    }

    return () => {
        unhookupClickEvents();

        for (const id of characterTabIds) {
            unbindElementById(id);
        }
    };
}

/** helper for bindCharacterTabControls */
function bindTrackedCheckBox(id:string, property:Property<boolean>, set:Set<string>):void {
    set.add(id);
    bindCheckboxById(id, property);
}

/** helper for bindCharacterTabControls */
function bindTrackedComboBox<ValueType>(id:string, property:EnumProperty<ValueType>, set:Set<string>, stringToEnum:(s:string)=>ValueType, enumToString:(t:ValueType)=>string):void {
    set.add(id);
    bindComboBoxById<ValueType>(id, property, stringToEnum, enumToString);
}
/** helper for bindCharacterTabControls */
function bindTrackedImageChooser(id:string, property:Property<string|null>, set:Set<string>):void {
    set.add(id);
    bindImageChooserById(id, property, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
}

/** helper for bindCharacterTabControls */
function bindTrackedImageDisplay(id:string, property:Property<string|null>, set:Set<string>):void {
    set.add(id);
    bindImageDisplayById(id, property);
}

/** helper for bindCharacterTabControls */
function bindTrackedSlider(id:string, valueLabelId:string|null, property:Property<number>, set:Set<string>):void {
    set.add(id);
    bindSliderById(id, valueLabelId, property);
}

/** helper for bindCharacterTabControls */
function bindTrackedStyle<ValueType>(id:string, property:Property<ValueType>, cb:(value:ValueType, classList:DOMTokenList)=>void, set:Set<string>):void {
    set.add(id);
    bindStyleById<ValueType>(id, property, cb);
}

/** helper for bindCharacterTabControls */
function bindTrackedText(id:string, property:Property<string>, set:Set<string>):void {
    set.add(id);
    bindTextById(id, property);
}

/** helper for bindCharacterTabControls */
function bindTrackedVisibility(id:string, property:Property<boolean>, set:Set<string>):void {
    set.add(id);
    bindVisibilityById(id, property);
}

/** make the entire character tab disabled */
function disableCharacterTab():void {
    const tabDiv = document.getElementById('charactertab');
    if (!tabDiv) { return; }
    const tags:ReadonlyArray<TagsThatCanBeDisabled> = ['button', 'fieldset', 'optgroup', 'option', 'select', 'textarea', 'input'];
    for (const tag of tags) {
        const elements = tabDiv.getElementsByTagName(tag);
        for (let i=0;i<elements.length;i++){
            const item = elements.item(i);
            if (item) {
                item.disabled = true;
            }
        }
    }
}

/** undo disableCharacterTab */
function enableCharacterTab():void {
    const tabDiv = document.getElementById('charactertab');
    if (!tabDiv) { return; }
    const tags:ReadonlyArray<TagsThatCanBeDisabled> = ['button', 'fieldset', 'optgroup', 'option', 'select', 'textarea', 'input'];
    for (const tag of tags) {
        const elements = tabDiv.getElementsByTagName(tag);
        for (let i=0;i<elements.length;i++){
            const item = elements.item(i);
            if (item) {
                item.disabled = false;
            }
        }
    }
}

/** update character tab to show this character */
export function setSelectedCharacter(value:Character|null):void {
    if (unbindCharacterTabControls) {unbindCharacterTabControls();}
    unbindCharacterTabControls = null;
    if (value) {
        unbindCharacterTabControls = bindCharacterTabControls(value);
        enableCharacterTab();
    } else {
        disableCharacterTab();
    }
}

/** returned by bindCharacterTabControls, used to undo what it did */
let unbindCharacterTabControls:(()=>void)|null = null;

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