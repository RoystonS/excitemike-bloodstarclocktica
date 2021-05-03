import * as BloodBind from './bind/bindings';
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import { ObservableCollection } from './bind/observable-collection';
import * as SpinnerDlg from './dlg/spinner-dlg';
import * as LoginDlg from "./dlg/blood-login-dlg";
import * as MessageDlg from "./dlg/blood-message-dlg";
import * as BloodIO from "./blood-io";
import {Character} from "./model/character";
import {Edition} from "./model/edition";
import {initNightOrderBindings} from './night-order';
import {walkHTMLElements} from './util';
import './styles/main.css';
import './styles/autogrowtextarea.css';
import './styles/characterlist.css';
import './styles/dialog.css';
import './styles/dragdrop.css';
import './styles/menu.css';
import './styles/nightorder.css';
import './styles/tabs.css';
import { parseBloodTeam } from './model/blood-team';
import { PropKey } from './bind/observable-object';
import { CharacterImageSettings } from './model/character-image-settings';

let edition = new Edition();
let username = '';
let password = '';
const selectedCharacter = new BloodBind.Property<Character|null>(null);

/** returned by bindCharacterTabControls, used to undo what it did */
let unbindCharacterTabControls:(()=>void)|null = null;

// TODO: move characterlist stuff to another module

/** need to track the listeners we add so that we can remove them */
const characterListCleanupSideTable = new Map<HTMLElement, BloodBind.PropertyChangeListener<Character|null>>();

/** helper type for disableCharacterTab */
type TagsThatCanBeDisabled = "button" | "fieldset" | "input" | "optgroup" | "option" | "select" | "textarea";

// TODO: exceptions in promises need to surface somewhere (test without internet connection!)

/**
 * create the HTMLElement for an item in the character list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
function makeCharacterListItem(character: Character, collection:ObservableCollection<Character>):HTMLElement {
    const row = document.createElement("div");
    row.className = "characterListItem";
    row.tabIndex = 0;
    row.onclick = e => { 
        if (e.target === row) {
            selectedCharacter.set(character);
            tabClicked('charTabBtn','charactertab');
        }
    }
    row.onkeyup = e => {
        switch (e.code) {
            case 'Space':
            case 'Enter':
                selectedCharacter.set(character);
                tabClicked('charTabBtn','charactertab');
                break;
        }
    }

    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        BloodBind.bindCheckbox(checkbox, character.export);
        row.appendChild(checkbox);
    }

    {
        const nameElement = document.createElement("span");
        nameElement.className = "characterListName";
        BloodBind.bindText(nameElement, character.name);
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
    selectedCharacter.addListener(cb);
    characterListCleanupSideTable.set(row, cb);

    return row;
};

/** recurses though children of element cleaning up click events and bindings */
function cleanupListItem(element: Node, character: Character): void {
    if (selectedCharacter.get() === character) {
        selectedCharacter.set(null);
    }

    if (element instanceof HTMLElement) {
        walkHTMLElements(element, htmlElement=>{
            htmlElement.onclick = null;
            BloodBind.unbindElement(htmlElement);
        });

        // cleanup listener from makeCharacterListItem
        {
            const cb = characterListCleanupSideTable.get(element);
            if (cb) {
                selectedCharacter.removeListener(cb);
            }
            characterListCleanupSideTable.delete(element);
        }
    }
}

/** add a new character to the custom edition */
function addCharacterClicked(_: Event): void {
    edition.addNewCharacter();
}

/** clicked the help menu button */
function showHelp() {
    // TODO: implement showHelp
    MessageDlg.show('`showHelp` Not yet implemented');
}

/** set event listeners for clicks, return a funciton you can call to undo it */
function hookupClickEvents(data: [string, (e: Event) => void][]):()=>void {
  for (const [id, cb] of data) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", cb);
    }
  }

  const backupData = data;
  return ()=>{
    for (const [id, cb] of backupData) {
      const element = document.getElementById(id);
      if (element) {
        element.removeEventListener("click", cb);
      }
    }
  }
}

/**
 * maintain a list of recent files - both in the menu and in local storage
 * @param name file name
 */
function addToRecentFiles(_name:string):void {
    // TODO
    updateRecentFilesMenu();
}

/**
 * If a file turns out to be delted or renamed or something, delete the old
 * name from the list
 * @param name file name to remove
 */
//function removeFromRecentFiles(_name:string):void {
    // TODO
//}

/**
 * update the recent files menu based on the recent files in local storage
 */
function updateRecentFilesMenu():void {
    // TODO
}

/**
 * user chose to open a new file
 */
export async function newFileClicked():Promise<boolean> {
    await BloodIO.newEdition(edition);
    return true;
}

/**
 * user chose to open a file
 */
 export async function openFileClicked():Promise<boolean> {
    if (await BloodIO.open(username, password, edition)) {
        // TODO: auto-select one character
        addToRecentFiles(edition.saveName.get());
        return true;
    }
    return false;
}

/**
 * user chose to save the current file
 */
export async function saveFileClicked():Promise<boolean> {
    if (await BloodIO.save(username, password, edition)) {
        addToRecentFiles(edition.saveName.get());
        return true;
    }
    return false;
}

/**
 * user chose to save the current file under a new name
 */
export async function saveFileAsClicked():Promise<boolean> {
    if (await BloodIO.saveAs(username, password, edition)) {
        addToRecentFiles(edition.saveName.get());
        return true;
    }
    return false;
}

/** user chose to import character(s) from a json file */
async function importJsonClicked():Promise<boolean> {
    // TODO: implement importJsonClicked
    MessageDlg.show('`importJsonClicked` Not yet implemented');
    return false;
}

/** user chose to import official character(s) */
async function importOfficialClicked():Promise<boolean> {
    // TODO: implement importOfficialClicked
    MessageDlg.show('`importOfficialClicked` Not yet implemented');
    return false;
}

/** user chose to save and publish */
async function saveAndPublishClicked():Promise<boolean> {
    // TODO: implement saveAndPublishClicked
    MessageDlg.show('`saveAndPublishClicked` Not yet implemented');
    return false;
}

/**
 * switch to a tab
 */
function tabClicked(btnId:string, tabId:string):void {
    {
        const allTabBtns = document.getElementsByClassName("tabButton");
        for (let i = 0; i < allTabBtns.length; i++) {
            const tabBtn = allTabBtns[i];
            tabBtn.classList.remove('selectedTabBtn');
        }
    }
    {
        const allTabs = document.getElementsByClassName("tab");
        for (let i = 0; i < allTabs.length; i++) {
            const tabBtn = allTabs[i];
            tabBtn.classList.remove('activeTab');
        }
    }
    {
        const tabBtn = document.getElementById(btnId);
        if (tabBtn) {
            tabBtn.classList.add('selectedTabBtn');
        }
    }
    {
        const tabDiv = document.getElementById(tabId);
        if (tabDiv) {
            tabDiv.classList.add('activeTab');
        }
    }
}

/** prompt for login information */
async function login():Promise<void> {
    while (true) {
        try {
            const loginInfo = await LoginDlg.show("Enter username and password");
            if (loginInfo) {
                let {username:newUsername, password:newPassword} = loginInfo;
                username = newUsername;
                password = newPassword;
                if (await SpinnerDlg.show('Logging in', BloodIO.login(username, password))) {
                    break;
                }
            }
        } catch (e) {
            console.error(e);
            MessageDlg.showError(e);
        }
    }
}

/** initialize listeners and data bindings */
function initBindings():void {
    window.onbeforeunload = function () {
        return "Are you sure you want to leave? Unsaved changes will be lost.";
    };

    document.onkeydown = (e) => {
        if (e.ctrlKey) {
            if (e.code === "KeyS") {
                e.preventDefault();
                BloodIO.save(username, password, edition);
            }
        }
    };
    hookupClickEvents([
        ['addCharacterButton', addCharacterClicked],
        ['newfilebutton', newFileClicked],
        ['openfilebutton', openFileClicked],
        ['savefilebutton', saveFileClicked],
        ['savefileasbutton', saveFileAsClicked],
        ['importJsonButton', importJsonClicked],
        ['importOfficialButton', importOfficialClicked],
        ['saveAndPublishButton', saveAndPublishClicked],
        ['helpbutton', showHelp],
        ['metaTabBtn', ()=>tabClicked('metaTabBtn','metatab')],
        ['charTabBtn', ()=>tabClicked('charTabBtn','charactertab')],
        ['firstNightTabBtn', ()=>tabClicked('firstNightTabBtn','firstNightOrderTab')],
        ['otherNightTabBtn', ()=>tabClicked('otherNightTabBtn','otherNightOrderTab')],
        ['metaLogoRemoveBtn', ()=>edition.meta.logo.set(null)]
    ]);

    BloodBind.bindTextById('windowTitle', edition.windowTitle);
    BloodBind.bindTextById('metaName', edition.meta.name);
    BloodBind.bindTextById('metaAuthor', edition.meta.author);
    BloodBind.bindTextById('metaSynopsis', edition.almanac.synopsis);
    BloodBind.bindTextById('metaOverview', edition.almanac.overview);
    BloodBind.bindImageChooserById('metaLogoInput', edition.meta.logo);
    BloodBind.bindImageDisplayById('metaLogoDisplay', edition.meta.logo);

    BloodBind.bindCollectionById(
        'characterList',
        edition.characterList,
        makeCharacterListItem,
        cleanupListItem
    );

    initNightOrderBindings(edition);
    
    // tie selected character to character tab
    selectedCharacter.addListener(selectedCharacterChanged);
    selectedCharacter.set(edition.characterList.get(0) || null);

    BloodBind.bindCheckboxById('previewOnToken', edition.previewOnToken);

    // TODO: status bar
}

/** helper for bindCharacterTabControls */
function bindTrackedText(id:string, property:BloodBind.Property<string>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindTextById(id, property);
}
/** helper for bindCharacterTabControls */
function bindTrackedComboBox<ValueType extends BloodBind.FieldType>(id:string, property:BloodBind.EnumProperty<ValueType>, set:Set<string>, stringToEnum:(s:string)=>ValueType, enumToString:(t:ValueType)=>string):void {
    set.add(id);
    BloodBind.bindComboBoxById<ValueType>(id, property, stringToEnum, enumToString);
}
/** helper for bindCharacterTabControls */
function bindTrackedCheckBox(id:string, property:BloodBind.Property<boolean>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindCheckboxById(id, property);
}
/** helper for bindCharacterTabControls */
function bindTrackedImageDisplay(id:string, property:BloodBind.Property<string|null>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindImageDisplayById(id, property);
}
/** helper for bindCharacterTabControls */
function bindTrackedImageChooser(id:string, property:BloodBind.Property<string|null>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindImageChooserById(id, property);
}
/** helper for bindCharacterTabControls */
function bindTrackedSlider(id:string, property:BloodBind.Property<number>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindSliderById(id, property);
}

/** set up character tab bindings */
function bindCharacterTabControls():(()=>void)|null {
    const character = selectedCharacter.get();
    if (!character) {return null;}
    
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
    bindTrackedImageDisplay('characterUnstyledImageDisplay', character.unStyledImage, characterTabIds);
    bindTrackedImageDisplay('characterStyledImageDisplay', character.styledImage, characterTabIds);

    // TODO: image settings bindings
    const imageStyleSettings:CharacterImageSettings = character.imageSettings;
    const imageStyleSettingsChangedListener = (_:PropKey<CharacterImageSettings>)=>{};
    imageStyleSettings.addPropertyChangedEventListener(imageStyleSettingsChangedListener);

    const characterTabButtonCleanupFn = hookupClickEvents([
        ['characterImageRemoveBtn', ()=>character.unStyledImage.set(null)]
    ]);

    // TODO: should probably have a separate developer mode where these don't show
    if (unbindCharacterTabControls) { MessageDlg.showError(new Error('binding character tab controls without clearing previous bindings')); }

    return () => {
        characterTabButtonCleanupFn();

        imageStyleSettings.removePropertyChangedEventListener(imageStyleSettingsChangedListener);

        for (const id of characterTabIds) {
            BloodBind.unbindElementById(id);
        }
    };
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
function selectedCharacterChanged(value:Character|null):void {
    if (unbindCharacterTabControls) {unbindCharacterTabControls();}
    unbindCharacterTabControls = null;
    if (value) {
        tabClicked('charTabBtn','charactertab');
        unbindCharacterTabControls = bindCharacterTabControls();
        enableCharacterTab();
    } else {
        disableCharacterTab();
    }
}

/** initialize CustomEdition object to bind to */
async function initCustomEdition():Promise<void> {
    try {
        while (true) {
            if (await BloodNewOpen.show()) {
                break;
            }
        }
    } catch (e) {
        console.error(e);
        edition.reset();
        MessageDlg.showError(e);
    }
}

/** prepare app */
async function init() {
    // need to get login info before we can do much of anything
    await login();

    await initCustomEdition();

    initBindings();
}

/**
 * get the username that the user logged in with
 * @returns username the user logged in with
 */
export function getUsername():string {
    return username;
}

/**
 * get the password that the user logged in with
 * @returns password the user logged in with
 */
export function getPassword():string {
    return password;
}

// wait for dom to load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    // `DOMContentLoaded` already fired
    init();
}
