import * as BloodDocument from "./blood-document";
import { BloodDrag } from "./blood-drag";
import BloodBind from "./blood-bind";
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import * as BloodIO from "./blood-io";

let bloodDocument = new BloodDocument.BloodDocument();
let characterListElement = null;

const makeCharacterListItem = (
  bloodCharacter: BloodDocument.BloodCharacter
) => {
  const row = document.createElement("div");
  row.className = "character-list-item";

  {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    BloodBind.bindCheckbox(checkbox, bloodCharacter.getExportProperty());
    row.appendChild(checkbox);
  }

  {
    const nameElement = document.createElement("a");
    nameElement.className = "character-list-name";
    nameElement.onclick = () =>
      console.log("clicked on " + bloodCharacter.getName());
    BloodBind.bindLabel(nameElement, bloodCharacter.getNameProperty());
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
function addToRecentDocuments(name:string):void {
    // TODO
    updateRecentDocumentsMenu();
}

/**
 * If a file turns out to be delted or renamed or something, delete the old
 * name from the list
 * @param name file name to remove
 */
function removeFromRecentDocuments(name:string):void {
    // TODO
}

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
    if (await BloodIO.open(bloodDocument)) {
        addToRecentDocuments(bloodDocument.getSaveName());
    }
}

/**
 * user chose to save the current file
 */
export async function saveFileClicked():Promise<void> {
    if (await BloodIO.save(bloodDocument)) {
        addToRecentDocuments(bloodDocument.getSaveName());
    }
}

/**
 * user chose to save the current file under a new name
 */
 export async function saveFileAsClicked():Promise<void> {
    if (await BloodIO.saveAs(bloodDocument)) {
        addToRecentDocuments(bloodDocument.getSaveName());
    }
}

/**
 * prepare app
 */
async function init() {
  window.onbeforeunload = function () {
    return "Are you sure you want to leave? Unsaved changes will be lost.";
  };

  document.onkeydown = (e) => {
    if (e.ctrlKey) {
      if (e.code === "KeyS") {
        e.preventDefault();
        BloodIO.save(bloodDocument);
      }
    }
  };
  hookupClickEvents([
    ["addcharacterbutton", addCharacterClicked],
    ["newfilebutton", newFileClicked],
    ["openfilebutton", openFileClicked],
    ["savefilebutton", saveFileClicked],
    ["savefileasbutton", saveFileAsClicked],
    ["helpbutton", showHelp],
  ]);

  try {
    let opened = false;
    while (!opened) {
      const result = await BloodNewOpen.show();
      const { openName, newName } = result;
      if (openName) {
        opened = await BloodIO.save(bloodDocument);
      } else if (newName) {
        bloodDocument.reset(newName);
        opened = true;
      } else {
        throw new Error("Bad result from new-open-dlg");
      }
    }
  } catch (e) {
    console.error(e);
    bloodDocument.reset("sandbox");
  }
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

// wait for dom to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  // `DOMContentLoaded` already fired
  init();
}
