import * as BloodSdc from './blood-save-discard-cancel.js';

export function newFile() {
    BloodSdc.savePromptIfDirty().then(() => {
      bloodDocument.reset();
      const characterListElement = document.getElementById('characterlist');
      BloodDrag.renderItems(characterListElement, bloodDocument.getCharacterList(), makeCharacterListItem, cleanupListItem);
    });
  };

export function openFile() {
    BloodSdc.savePromptIfDirty()
    .then(() => {
        alert("not yet implemented");
    });
}

export function saveFile() {
    BloodSdc.doSave();
}

export function saveFileAs() {
    alert("not yet implemented");
}