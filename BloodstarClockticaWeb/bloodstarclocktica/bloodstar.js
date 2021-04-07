var main =(function()
{
  "use strict";

  let bloodDocument = new BloodDocument();

  const makeCharacterListItem = (characterName) => {
    const row = document.createElement('div');
    row.className = 'character-list-item';
    
    {
        const name = document.createElement('a');
        name.className = 'character-list-name';
        name.onclick = ()=>console.log(characterName);
        name.innerText = characterName;
        row.appendChild(name);
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

  const init = () => {
    document.onkeyup = e => {
        if (e.ctrlKey) {
            if (e.code === 'KeyN') {
                e.preventDefault();
                alert('ctrl N');
            }
        }
    }
    
    var characterList = document.getElementById('characterlist');
    const data = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.'.split(' ');
    BloodstarDrag.renderItems(characterList, data, makeCharacterListItem);
  };

  // wait for dom to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // `DOMContentLoaded` already fired
    init();
  }
})();