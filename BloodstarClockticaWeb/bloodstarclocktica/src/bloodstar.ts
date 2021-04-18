import * as BloodDocument from './blood-document';
import { BloodDrag } from './blood-drag';
import BloodBind from './blood-bind';
import * as BloodNewOpen from './dlg/blood-new-open-dlg';
import * as BloodOpenDlg from './dlg/blood-open-dlg';
import * as BloodSdc from './dlg/blood-save-discard-cancel';

let bloodDocument = new BloodDocument.BloodDocument();
let characterListElement = null;

const makeCharacterListItem = (bloodCharacter:BloodDocument.BloodCharacter) => {
  const row = document.createElement('div');
  row.className = 'character-list-item';

  {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    BloodBind.bindCheckbox(checkbox, bloodCharacter.getExportProperty());
    row.appendChild(checkbox);
  }
  
  {
      const nameElement = document.createElement('a');
      nameElement.className = 'character-list-name';
      nameElement.onclick = ()=>console.log(bloodCharacter.getName());
      BloodBind.bindLabel(nameElement, bloodCharacter.getNameProperty());
      row.appendChild(nameElement);
  }

  {
      const up = document.createElement('a');
      up.className = 'character-list-button';
      up.innerText = '▲';
      up.onclick = ()=>console.log('up button clicked');
      row.appendChild(up);
  }

  {
      const down = document.createElement('a');
      down.className = 'character-list-button';
      down.innerText = '▼';
      down.onclick = ()=>console.log('down button clicked');
      row.appendChild(down);
  }

  {
      const del = document.createElement('a');
      del.className = 'character-list-button';
      del.innerText = 'Delete';
      del.onclick = ()=>console.log('delete button clicked');
      row.appendChild(del);
  }

  return row;
};
function cleanupListItem(node:Node):void {
  node.childNodes.forEach(node => {
    BloodBind.unbindElement(node);
    node.childNodes.forEach(cleanupListItem);
  });
};
function addCharacterClicked(_:Event):void {
  bloodDocument.addNewCharacter();
  const characterListElement = document.getElementById('characterlist');
  if (characterListElement) {
    BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
  }
}
function showHelp() {

}
function hookupClickEvents(data:[string,(e:Event)=>void][]) {
  for (const [id, cb] of data) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', cb);
    }
  }
}

/// file > new clicked
async function newFile(){
  if (await BloodSdc.savePromptIfDirty()) {
    bloodDocument.reset('New Edition');
  }
}

/// file > open clicked
async function openFile(){
  if (await BloodSdc.savePromptIfDirty()) {
    const name = await BloodOpenDlg.show();
    if (name) {
      await bloodDocument.open(name);
    }
  }
}
/// file > save clicked
async function saveFile(){
  await bloodDocument.save();
}
/// file > save as clicked
async function saveFileAs(){
  throw new Error('not yet implemented');
}

async function init() {
  document.onkeydown = e => {
      if (e.ctrlKey) {
          if (e.code === 'KeyS') {
              e.preventDefault();
              saveFile();
          }
      }
  }
  hookupClickEvents([
    ['addcharacterbutton', addCharacterClicked],
    ['newfilebutton', newFile],
    ['openfilebutton', openFile],
    ['savefilebutton', saveFile],
    ['savefileasbutton', saveFileAs],
    ['helpbutton', showHelp],
  ]);

  try {
    const result = await BloodNewOpen.show();
    const {openName,newName} = result;
    if (openName) {
      await bloodDocument.open(openName);
    } else if (newName) {
      bloodDocument.reset(newName);
    } else {
      throw new Error('Bad result from new-open-dlg');
    }
  } catch (e) {
    console.error(e);
    bloodDocument.reset('sandbox');
  }
  characterListElement = document.getElementById('characterlist');
  if (characterListElement) {
    BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
  }
};

// wait for dom to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  // `DOMContentLoaded` already fired
  init();
}

export function getDocument() {
  return bloodDocument;
}