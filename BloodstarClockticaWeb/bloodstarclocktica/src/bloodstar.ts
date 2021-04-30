import {Character, CustomEdition} from "./custom-edition";
import * as BloodBind from './bind/bindings';
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import * as SpinnerDlg from './dlg/spinner-dlg';
import * as LoginDlg from "./dlg/blood-login-dlg";
import * as MessageDlg from "./dlg/blood-message-dlg";
import * as BloodIO from "./blood-io";
import './styles/main.css';
import './styles/autogrowtextarea.css';
import './styles/characterlist.css';
import './styles/dialog.css';
import './styles/dragdrop.css';
import './styles/menu.css';
import './styles/tabs.css';

let customEdition = new CustomEdition();
let username = '';
let password = '';
const selectedCharacter = new BloodBind.Property<Character|null>(null);

/** need to track the listeners we add so that we can remove them */
const characterListCleanupSideTable = new Map<HTMLElement, BloodBind.PropertyChangeListener<Character|null>>();

/** list of ids of all controls on character tab that might need to be disabled */
let characterTabIds:Set<string> = new Set<string>();

/** cleanup function used to undo click event bindings set by `bindCharacterTabControls` */
let characterTabButtonCleanupFn:(()=>void)|null = null;

/** helper type for disableCharacterTab */
type TagsThatCanBeDisabled = "button" | "fieldset" | "input" | "optgroup" | "option" | "select" | "textarea";

// TODO: exceptions in promises need to surface somewhere (test without internet connection!)

/**
 * create the HTMLElement for an item in the character list
 * @param character character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
function makeCharacterListItem(character: Character):HTMLElement {
    const row = document.createElement("div");
    row.className = "character-list-item";
    row.onclick = e => { 
        if (e.target === row) {
            selectedCharacter.set(character); tabClicked('charTabBtn','charactertab');
        }
    }

    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        BloodBind.bindCheckbox(checkbox, character.getExportProperty());
        row.appendChild(checkbox);
    }

    {
        const nameElement = document.createElement("span");
        nameElement.className = "character-list-name";
        BloodBind.bindText(nameElement, character.getNameProperty());
        row.appendChild(nameElement);
    }

    {
        const up = document.createElement("button");
        up.className = "character-list-button";
        up.innerText = "▲";
        up.onclick = () => customEdition.moveCharacterUp(character);
        row.appendChild(up);
    }

    {
        const down = document.createElement("button");
        down.className = "character-list-button";
        down.innerText = "▼";
        down.onclick = () => customEdition.moveCharacterDown(character);
        row.appendChild(down);
    }

    {
        const del = document.createElement("button");
        del.className = "character-list-button";
        del.innerText = "Delete";
        del.onclick = () => customEdition.deleteCharacter(character);
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
    if (!(element instanceof HTMLElement)) {return;}
    const stack:HTMLElement[] = [element];
    while (stack.length) {
        const htmlElement = stack.pop();
        if (htmlElement) {
            htmlElement.onclick = null;
            BloodBind.unbindElement(htmlElement);
            for (let i=0; i<htmlElement.children.length;i++) {
                const child = htmlElement.children[i];
                if (child instanceof HTMLElement) {
                    stack.push(child);
                }
            }
        }
    }
    if (selectedCharacter.get() === character) {
        selectedCharacter.set(null);
    }

    // cleanup listener from makeCharacterListItem
    {
        const cb = characterListCleanupSideTable.get(element);
        if (cb) {
            selectedCharacter.removeListener(cb);
        }
        characterListCleanupSideTable.delete(element);
    }
}

/** add a new character to the custom edition */
function addCharacterClicked(_: Event): void {
    customEdition.addNewCharacter();
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
    await BloodIO.newCustomEdition(customEdition);
    return true;
}

/**
 * user chose to open a file
 */
 export async function openFileClicked():Promise<boolean> {
    if (await BloodIO.open(username, password, customEdition)) {
        addToRecentFiles(customEdition.getSaveName());
        return true;
    }
    return false;
}

/**
 * user chose to save the current file
 */
export async function saveFileClicked():Promise<boolean> {
    if (await BloodIO.save(username, password, customEdition)) {
        addToRecentFiles(customEdition.getSaveName());
        return true;
    }
    return false;
}

/**
 * user chose to save the current file under a new name
 */
export async function saveFileAsClicked():Promise<boolean> {
    if (await BloodIO.saveAs(username, password, customEdition)) {
        addToRecentFiles(customEdition.getSaveName());
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
                BloodIO.save(username, password, customEdition);
            }
        }
    };
    hookupClickEvents([
        ['addcharacterbutton', addCharacterClicked],
        ['newfilebutton', newFileClicked],
        ['openfilebutton', openFileClicked],
        ['savefilebutton', saveFileClicked],
        ['savefileasbutton', saveFileAsClicked],
        ['importJsonButton', importJsonClicked],
        ['importOfficialButton', importOfficialClicked],
        ['helpbutton', showHelp],
        ['metaTabBtn', ()=>tabClicked('metaTabBtn','metatab')],
        ['charTabBtn', ()=>tabClicked('charTabBtn','charactertab')],
        ['firstNightTabBtn', ()=>tabClicked('firstNightTabBtn','firstnightordertab')],
        ['otherNightTabBtn', ()=>tabClicked('otherNightTabBtn','othernightordertab')],
        ['metaLogoRemoveBtn', ()=>customEdition.getLogoProperty().set(null)]
    ]);

    BloodBind.bindTextById('metaName', customEdition.getNameProperty());
    BloodBind.bindTextById('metaAuthor', customEdition.getAuthorProperty());
    BloodBind.bindTextById('metaSynopsis', customEdition.getSynopsisProperty());
    BloodBind.bindTextById('metaOverview', customEdition.getOverviewProperty());
    BloodBind.bindImageChooserById('metaLogoInput', customEdition.getLogoProperty());
    BloodBind.bindImageDisplayById('metaLogoDisplay', customEdition.getLogoProperty());

    BloodBind.bindCollectionById(
        'characterlist',
        customEdition.getCharacterList(),
        makeCharacterListItem,
        cleanupListItem
    );
    
    // tie selected character to character tab
    selectedCharacter.addListener(selectedCharacterChanged);
    selectedCharacter.set(customEdition.getCharacterList().get(0) || null);

    BloodBind.bindCheckboxById('previewOnToken', customEdition.getPreviewOnTokenProperty());
}

/** helper for bindCharacterTabControls */
function bindTrackedText(id:string, property:BloodBind.Property<string>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindTextById(id, property);
}
/** helper for bindCharacterTabControls */
function bindTrackedComboBox(id:string, property:BloodBind.EnumProperty<string>, set:Set<string>):void {
    set.add(id);
    BloodBind.bindComboBoxById(id, property);
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

/** set up character tab bindings */
function bindCharacterTabControls():void {
    const character = selectedCharacter.get();
    if (!character) {return;}
    characterTabIds.clear();
    bindTrackedText('characterId', character.getIdProperty(), characterTabIds);
    bindTrackedText('characterName', character.getNameProperty(), characterTabIds);
    bindTrackedComboBox('characterTeam', character.getTeamProperty(), characterTabIds);
    bindTrackedText('characterAbility', character.getAbilityProperty(), characterTabIds);
    bindTrackedText('characterFirstNightReminder', character.getFirstNightReminderProperty(), characterTabIds);
    bindTrackedText('characterOtherNightReminder', character.getOtherNightReminderProperty(), characterTabIds);
    bindTrackedCheckBox('characterSetup', character.getSetupProperty(), characterTabIds);
    bindTrackedText('characterReminderTokens', character.getCharacterReminderTokensProperty(), characterTabIds);
    bindTrackedText('globalReminderTokens', character.getGlobalReminderTokensProperty(), characterTabIds);
    bindTrackedCheckBox('characterExport', character.getExportProperty(), characterTabIds);
    bindTrackedText('characterAttribution', character.getAttributionProperty(), characterTabIds);
    bindTrackedText('characterAlmanacFlavor', character.getAlmanac().getFlavorProperty(), characterTabIds);
    bindTrackedText('characterAlmanacOverview', character.getAlmanac().getOverviewProperty(), characterTabIds);
    bindTrackedText('characterAlmanacExamples', character.getAlmanac().getExamplesProperty(), characterTabIds);
    bindTrackedText('characterAlmanacHowToRun', character.getAlmanac().getHowToRunProperty(), characterTabIds);
    bindTrackedText('characterAlmanacTip', character.getAlmanac().getTipProperty(), characterTabIds);
    bindTrackedImageChooser('characterUnstyledImageInput', character.getUnStyledImageProperty(), characterTabIds);
    bindTrackedImageDisplay('characterUnstyledImageDisplay', character.getUnStyledImageProperty(), characterTabIds);
    bindTrackedImageDisplay('characterStyledImageDisplay', character.getStyledImageProperty(), characterTabIds);

    characterTabButtonCleanupFn = hookupClickEvents([
        ['characterImageRemoveBtn', ()=>character.setUnStyledImage(null)]
    ]);
}

/** clean up character tab bindings */
function unbindCharacterTabControls():void {
    for (const id of characterTabIds) {
        BloodBind.unbindElementById(id);
    }
    if (characterTabButtonCleanupFn) {
        const backup = characterTabButtonCleanupFn;
        characterTabButtonCleanupFn = null;
        backup();
    }
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
    unbindCharacterTabControls();
    if (value) {
        tabClicked('charTabBtn','charactertab');
        bindCharacterTabControls();
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
        customEdition.reset();
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
