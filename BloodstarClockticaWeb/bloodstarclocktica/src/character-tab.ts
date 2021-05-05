/**
 * code for character tab
 * @module CharacterTab
 */
import {bindCheckboxById, bindComboBoxById, bindImageChooserById, bindImageDisplayById, bindSliderById, bindTextById, EnumProperty, FieldType, Property, unbindElementById} from './bind/bindings';
import * as MessageDlg from "./dlg/blood-message-dlg";
import BloodImage, { getGradientForTeam, ProcessImageSettings, urlToBloodImage } from './blood-image';
import { parseBloodTeam } from './model/blood-team';
import { Character } from './model/character';
import { CharacterImageSettings } from './model/character-image-settings';
import {hookupClickEvents} from './util';
import Images from './images';

/** helper type for disableCharacterTab */
type TagsThatCanBeDisabled = "button" | "fieldset" | "input" | "optgroup" | "option" | "select" | "textarea";

/** set up character tab bindings */
function bindCharacterTabControls(character:Character):(()=>void)|null {
    let characterTabIds:Set<string> = new Set<string>();
    bindTrackedText('characterId', character.id, characterTabIds);
    bindTrackedText('characterName', character.name, characterTabIds);
    bindTrackedComboBox('characterTeam', character.team, characterTabIds, parseBloodTeam, x=>x);
    bindTrackedText('characterAbility', character.ability, characterTabIds);
    bindTrackedText('characterFirstNightReminder', character.firstNightReminder, characterTabIds);
    bindTrackedText('characterOtherNightReminder', character.otherNightReminder, characterTabIds);
    bindTrackedCheckBox('characterSetup', character.setup, characterTabIds);
    bindTrackedText('characterReminderTokens', character.characterReminderTokens, characterTabIds);
    bindTrackedText('globalReminderTokens', character.globalReminderTokens, characterTabIds);
    bindTrackedCheckBox('characterExport', character.export, characterTabIds);
    bindTrackedText('characterAttribution', character.attribution, characterTabIds);
    bindTrackedText('characterAlmanacFlavor', character.almanac.flavor, characterTabIds);
    bindTrackedText('characterAlmanacOverview', character.almanac.overview, characterTabIds);
    bindTrackedText('characterAlmanacExamples', character.almanac.examples, characterTabIds);
    bindTrackedText('characterAlmanacHowToRun', character.almanac.howToRun, characterTabIds);
    bindTrackedText('characterAlmanacTip', character.almanac.tip, characterTabIds);
    bindTrackedImageChooser('characterUnstyledImageInput', character.unStyledImage, characterTabIds);
    bindTrackedImageDisplay('characterStyledImageDisplay', character.styledImage, characterTabIds);

    bindTrackedText('curvedCharacterNameTextPath', character.name, characterTabIds);

    const sliderHelper = (id:string, p:Property<number>) => {
        bindTrackedSlider(id, `${id}ValueLabel`, p, characterTabIds);
    };

    bindTrackedCheckBox('shouldRestyle', character.imageSettings.shouldRestyle, characterTabIds);
    bindTrackedCheckBox('shouldReposition', character.imageSettings.shouldReposition, characterTabIds);
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
    
    const regenCb = (_:any)=>regenerateStyledImage(character);
    const imageStyleSettings:CharacterImageSettings = character.imageSettings;
    imageStyleSettings.addPropertyChangedEventListener(regenCb);
    character.unStyledImage.addListener(regenCb);
    character.team.addListener(regenCb);

    const unhookupClickEvents = hookupClickEvents([
        ['characterImageRemoveBtn', ()=>character.unStyledImage.set(null)],
        ['resetImageSettings', ()=>character.imageSettings.reset()]
    ]);

    // TODO: should probably have a separate developer mode where these don't show
    if (unbindCharacterTabControls) { MessageDlg.showError(new Error('binding character tab controls without clearing previous bindings')); }

    return () => {
        unhookupClickEvents();

        character.team.removeListener(regenCb);
        character.unStyledImage.removeListener(regenCb);
        imageStyleSettings.removePropertyChangedEventListener(regenCb);

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
function bindTrackedComboBox<ValueType extends FieldType>(id:string, property:EnumProperty<ValueType>, set:Set<string>, stringToEnum:(s:string)=>ValueType, enumToString:(t:ValueType)=>string):void {
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
function bindTrackedText(id:string, property:Property<string>, set:Set<string>):void {
    set.add(id);
    bindTextById(id, property);
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

/** generate styled image from unstyled image and image settings */
async function regenerateStyledImage(character:Character):Promise<void> {
    const unstyledImage = character.unStyledImage.get();
    const imageSettings = character.imageSettings;
    if (!unstyledImage || !imageSettings.shouldRestyle.get()) {
        character.styledImage.set(unstyledImage);
        return;
    }
    
    // start from the unstyled image
    let bloodImage = await urlToBloodImage(unstyledImage, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);

    // crop
    if (imageSettings.shouldReposition.get()) {
        bloodImage = bloodImage.trim();
    }

    // colorize
    if (imageSettings.shouldColorize.get()) {
        const gradientImage = await getGradientForTeam(
            character.team.get(),
            imageSettings.useOutsiderAndMinionColors.get(),
            bloodImage.width,
            bloodImage.height
        );
        bloodImage.setRGB(255,255,255);
        bloodImage.multiply(gradientImage.resized(bloodImage.width, bloodImage.height));
    }

    // make full size image with icon pasted into the correct place
    if (imageSettings.shouldReposition.get()) {
        bloodImage = new BloodImage([ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT])
            .pasteZoomed(
                bloodImage,
                ProcessImageSettings.USABLE_REGION_X,
                ProcessImageSettings.USABLE_REGION_Y,
                ProcessImageSettings.USABLE_REGION_WIDTH,
                ProcessImageSettings.USABLE_REGION_HEIGHT
            );
    } else {
        bloodImage = bloodImage.fit(ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
    }

    // texture
    if (imageSettings.useTexture.get()) {
        const tokenTexture = await urlToBloodImage(Images.TEXTURE_URL, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
        bloodImage.multiply(tokenTexture);
    }

    // border
    if (imageSettings.useBorder.get()) {
        bloodImage.addBorder(imageSettings.borderIntensity.get());
    }

    // dropshadow
    if (imageSettings.useDropshadow.get()) {
        bloodImage = bloodImage.addDropShadow(
            imageSettings.dropShadowSize.get(),
            imageSettings.dropShadowOffsetX.get(),
            imageSettings.dropShadowOffsetY.get(),
            imageSettings.dropShadowOpacity.get());
    }
    character.styledImage.set(bloodImage.toDataUri());
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