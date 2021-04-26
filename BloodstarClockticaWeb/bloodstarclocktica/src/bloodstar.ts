import * as BloodDocument from "./blood-document";
import { BloodDrag } from "./blood-drag";
import * as BloodBind from "./blood-bind";
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import * as LoadDlg from './dlg/blood-loading-dlg';
import * as LoginDlg from "./dlg/blood-login-dlg";
import * as BloodIO from "./blood-io";

// TODO: stop using "document" everywhere. it has another meaning in JS
let bloodDocument = new BloodDocument.BloodDocument();
let characterListElement = null;
let username = '';
let password = '';

/**
 * create the HTMLElement for an item in the character list
 * @param bloodCharacter character for which we are making a list item
 * @returns HTMLElement to represent that character
 */
function makeCharacterListItem(bloodCharacter: BloodDocument.BloodCharacter):HTMLElement {
    const row = document.createElement("div");
    row.className = "character-list-item";

    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        BloodBind.bindCheckbox(checkbox, bloodCharacter.getExportProperty());
        row.appendChild(checkbox);
    }

    {
        const nameElement = document.createElement("a");
        nameElement.className = "character-list-name";
        nameElement.onclick = () =>
        console.log("clicked on " + bloodCharacter.getName());
        BloodBind.bindText(nameElement, bloodCharacter.getNameProperty());
        row.appendChild(nameElement);
    }

    {
        const up = document.createElement("a");
        up.className = "character-list-button";
        up.innerText = "▲";
        up.onclick = () => console.log("up button clicked");
        row.appendChild(up);
    }

    {
        const down = document.createElement("a");
        down.className = "character-list-button";
        down.innerText = "▼";
        down.onclick = () => console.log("down button clicked");
        row.appendChild(down);
    }

    {
        const del = document.createElement("a");
        del.className = "character-list-button";
        del.innerText = "Delete";
        del.onclick = () => console.log("delete button clicked");
        row.appendChild(del);
    }

    return row;
};

function cleanupListItem(node: Node): void {
  node.childNodes.forEach((node) => {
    BloodBind.unbindElement(node);
    node.childNodes.forEach(cleanupListItem);
  });
}
function addCharacterClicked(_: Event): void {
  bloodDocument.addNewCharacter();
  const characterListElement = document.getElementById("characterlist");
  if (characterListElement) {
    BloodDrag.renderItems(
      characterListElement,
      bloodDocument.getCharacterList(),
      makeCharacterListItem,
      cleanupListItem
    );
  }
}
function showHelp() {}
function hookupClickEvents(data: [string, (e: Event) => void][]) {
  for (const [id, cb] of data) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", cb);
    }
  }
}

/**
 * maintain a list of recent files - both in the menu and in local storage
 * @param name file name
 */
function addToRecentDocuments(_name:string):void {
    // TODO
    updateRecentDocumentsMenu();
}

/**
 * If a file turns out to be delted or renamed or something, delete the old
 * name from the list
 * @param name file name to remove
 */
//function removeFromRecentDocuments(_name:string):void {
    // TODO
//}

/**
 * update the recent documents menu based on the recent documents in local storage
 */
function updateRecentDocumentsMenu():void {
    // TODO
}

/**
 * user chose to open a new file
 */
async function newFileClicked():Promise<void> {
    await BloodIO.newDocument(bloodDocument);
}

/**
 * user chose to open a file
 */
 export async function openFileClicked():Promise<void> {
    if (await BloodIO.open(username, password, bloodDocument)) {
        addToRecentDocuments(bloodDocument.getSaveName());
    }
}

/**
 * user chose to save the current file
 */
export async function saveFileClicked():Promise<void> {
    if (await BloodIO.save(username, password, bloodDocument)) {
        addToRecentDocuments(bloodDocument.getSaveName());
    }
}

/**
 * user chose to save the current file under a new name
 */
export async function saveFileAsClicked():Promise<void> {
    if (await BloodIO.saveAs(username, password, bloodDocument)) {
        addToRecentDocuments(bloodDocument.getSaveName());
    }
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
                if (await LoadDlg.show(BloodIO.login(username, password))) {
                    break;
                }
            }
        } catch (e) {
            console.error(e);
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
                BloodIO.save(username, password, bloodDocument);
            }
        }
    };
    hookupClickEvents([
        ['addcharacterbutton', addCharacterClicked],
        ['newfilebutton', newFileClicked],
        ['openfilebutton', openFileClicked],
        ['savefilebutton', saveFileClicked],
        ['savefileasbutton', saveFileAsClicked],
        ['helpbutton', showHelp],
        ['metaTabBtn', ()=>tabClicked('metaTabBtn','metatab')],
        ['charTabBtn', ()=>tabClicked('charTabBtn','charactertab')],
        ['firstNightTabBtn', ()=>tabClicked('firstNightTabBtn','firstnightordertab')],
        ['otherNightTabBtn', ()=>tabClicked('otherNightTabBtn','othernightordertab')],
    ]);

    BloodBind.bindTextById('metaName', bloodDocument.getNameProperty());
    BloodBind.bindTextById('metaAuthor', bloodDocument.getAuthorProperty());
    BloodBind.bindTextById('metaSynopsis', bloodDocument.getSynopsisProperty());
    BloodBind.bindTextById('metaOverview', bloodDocument.getOverviewProperty());
}

/** initialize document to bind to */
async function initDocument():Promise<void> {
    try {
        let opened = false;
        while (!opened) {
            const result = await BloodNewOpen.show();
            if (result) {
                const { openName, newName } = result;
                if (openName) {
                    opened = await BloodIO.save(username, password, bloodDocument);
                } else if (newName) {
                    bloodDocument.reset(newName);
                    opened = true;
                } else {
                    throw new Error("Bad result from new-open-dlg");
                }
            }
        }
    } catch (e) {
        console.error(e);
        bloodDocument.reset("sandbox");
    }
}

/** prepare character list */
function initCharacterList():void {
    characterListElement = document.getElementById("characterlist");
    if (characterListElement) {
        BloodDrag.renderItems(
            characterListElement,
            bloodDocument.getCharacterList(),
            makeCharacterListItem,
            cleanupListItem
        );
    }
}

/** prepare app */
async function init() {
    // need to get login info before we can do much of anything
    await login();

    await initDocument();
    initCharacterList();
    initBindings();

    // start on meta tab
    tabClicked('metaTabBtn','metatab');
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
