import { BloodDocument } from './blood-document.js';
import { BloodDrag } from './blood-drag.js';
import BloodBind from './blood-bind.js';
import * as BloodIO from './blood-io.js';

let bloodDocument = new BloodDocument();

const makeCharacterListItem = (bloodCharacter) => {
  const row = document.createElement('div');
  row.className = 'character-list-item';

  {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    BloodBind.bindCheckbox(checkbox, bloodCharacter.export);
    row.appendChild(checkbox);
  }
  
  {
      const nameElement = document.createElement('a');
      nameElement.className = 'character-list-name';
      nameElement.onclick = ()=>console.log(bloodCharacter.name.get());
      BloodBind.bindLabel(nameElement, bloodCharacter.name);
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
const cleanupListItem = element => {
  element.childNodes.forEach(node => {
    BloodBind.unbindElement(node);
    node.childNodes.forEach(cleanupListItem);
  });
};
const addCharacterClicked = (e) => {
  bloodDocument.addNewCharacter();
  const characterListElement = document.getElementById('characterlist');
  BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
}
function showHelp() {

}
const hookupClickEvents = (data) => {
  for (const [id, cb] of data) {
    const element = document.getElementById(id);
    element.addEventListener('click', cb);
  }
}
const init = () => {
  document.onkeydown = e => {
      if (e.ctrlKey) {
          if (e.code === 'KeyS') {
              e.preventDefault();
              BloodIO.saveFile();
          }
      }
  }
  hookupClickEvents([
    ['addcharacterbutton', addCharacterClicked],
    ['newfilebutton', BloodIO.newFile],
    ['openfilebutton', BloodIO.openFile],
    ['savefilebutton', BloodIO.saveFile],
    ['savefileasbutton', BloodIO.saveFileAs],
    ['helpbutton', showHelp],
  ]);

  const characterListElement = document.getElementById('characterlist');
  
  BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
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