import * as BloodBind from './bind/bindings';
import { ObservableCollection } from './bind/observable-collection';
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import * as SpinnerDlg from './dlg/spinner-dlg';
import * as LoginDlg from "./dlg/blood-login-dlg";
import * as MessageDlg from "./dlg/blood-message-dlg";
import * as BloodIO from "./blood-io";
import {Character} from "./model/character";
import {Edition} from "./model/edition";
import {initNightOrderBindings} from './night-order';
import {hookupClickEvents, walkHTMLElements} from './util';
import './styles/main.css';
import './styles/autogrowtextarea.css';
import './styles/characterlist.css';
import './styles/charactertab.css';
import './styles/dialog.css';
import './styles/dragdrop.css';
import './styles/menu.css';
import './styles/nightorder.css';
import './styles/slider.css';
import './styles/tabs.css';
import * as CharacterTab from './character-tab';
import { ProcessImageSettings } from './blood-image';
import Images from './images';

let edition = new Edition();
let username = '';
let password = '';
const selectedCharacter = new BloodBind.Property<Character|null>(null);

// TODO: move characterlist stuff to another module

/** need to track the listeners we add so that we can remove them */
const characterListCleanupSideTable = new Map<HTMLElement, BloodBind.PropertyChangeListener<Character|null>>();

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
        // TODO: confirm delete
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
    BloodBind.bindImageChooserById('metaLogoInput', edition.meta.logo, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
    BloodBind.bindImageDisplayById('metaLogoDisplay', edition.meta.logo);
    
    const tokenBackground = document.getElementById('tokenBackground');
    if (tokenBackground instanceof HTMLImageElement) {
        tokenBackground.src = Images.TOKEN_IMAGE;
        BloodBind.bindVisibility(tokenBackground, edition.previewOnToken);
    }

    BloodBind.bindCollectionById(
        'characterList',
        edition.characterList,
        makeCharacterListItem,
        cleanupListItem
    );

    initNightOrderBindings(edition);
    
    // tie selected character to character tab
    selectedCharacter.addListener(v=>{
        CharacterTab.setSelectedCharacter(v);
        if (v) {
            tabClicked('charTabBtn','charactertab');
        }
    });
    selectedCharacter.set(edition.characterList.get(0) || null);

    BloodBind.bindCheckboxById('previewOnToken', edition.previewOnToken);

    // TODO: status bar
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
