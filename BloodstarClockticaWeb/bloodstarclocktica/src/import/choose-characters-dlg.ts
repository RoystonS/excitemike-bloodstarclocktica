/**
 * dialog for choosing an official character to clone
 * @module ChooseCharactersDlg
 */
import {AriaDialog} from '../dlg/aria-dlg';
import { createElement, walkHTMLElements } from '../util';
import { CharacterEntry } from "./json";
import { parseBloodTeam } from "../model/blood-team";
import { setTeamColorStyle } from "../team-color";

/** convert list of entries to map by id */
function toMap(entries:CharacterEntry[]):Map<string, CharacterEntry> {
    const map = new Map<string, CharacterEntry>();
    for (const entry of entries){
        map.set(entry.id, entry);
    }
    return map;
}

/** dialog subclass for choosing an official character to clone */
export class ChooseCharactersDlg extends AriaDialog<CharacterEntry[]> {

    /** override for custom layout */
    protected addElementForCharacter(_character:CharacterEntry, container:HTMLElement, characterElement:HTMLElement):void {
        container.appendChild(characterElement);
    }
    
    /** override for custom layout */
    protected makeContainer():HTMLElement {
        return createElement({t:'div',css:['importOfficialList']});
    }

    async open(json:CharacterEntry[]):Promise<CharacterEntry[]> {
        const entriesById = toMap(json);
        const container = this.makeContainer();
        const onFilterChange=(e:Event)=>{
            if (e.target instanceof HTMLInputElement) {
                const filterString = e.target.value;
                walkHTMLElements(container, e=>{
                    doFilter(filterString, entriesById, e)
                });
            }
        };
        const updateButton = ():void=>{
            const buttonElem = this.querySelector<HTMLButtonElement>('#importButton');
            if (!buttonElem) {return;}
            const foundCharacters = container.querySelectorAll('input:checked');
            buttonElem.innerText = `Import ${foundCharacters.length} Characters`;
            buttonElem.disabled = foundCharacters.length===0;
        };
        const doImport = ():CharacterEntry[]=>{
            const selected = container.querySelectorAll('input:checked');
            const selectedCharacters = [];
            for (let i=0;i<selected.length;++i){
                const checkbox = selected[i] as HTMLElement;
                const characterId = checkbox.dataset['id'];
                if (!characterId) {continue;}
                const characterEntry = entriesById.get(characterId);
                if (!characterEntry){continue;}
                selectedCharacters.push(characterEntry);
            }
            return selectedCharacters;
        };
        const filterRow = createElement({
            t:'div',
            css:['row'],
            children:[
                {t:'label',a:{'for':'chooseOfficialFilter'},txt:'Filter'},
                {
                    t:'input',id:'chooseOfficialFilter',a:{name:'chooseOfficialFilter'},
                    events:{change:onFilterChange,input:onFilterChange}
                }
            ]});

        for (const character of json) {
            if (!character.name) {continue;}
            const characterContainer = createElement({
                t:'div',
                css:['importCharacter'],
                a:{title:character.ability||'','data-id':character.id},
                children:[
                    {t:'input',a:{type:'checkbox','data-id':character.id},id:`${character.id}-checkbox`,events:{change:updateButton}},
                    {t:'label',a:{for:`${character.id}-checkbox`},txt:character.name}
                ]
            });
            setTeamColorStyle(parseBloodTeam(character.team || ''), characterContainer.classList);
            this.addElementForCharacter(character, container, characterContainer);
        }

        return await this.baseOpen(
            document.activeElement,
            'importOfficial',
            [
                {t:'h1',txt:'Choose character(s) to import'},
                filterRow,
                container
            ],
            [{label:'Import 0 Characters',id:'importButton',callback:doImport,disabled:true},{label:'Cancel'}]
        )||[];
    }
}

/**
 * hide characters who don't pass the filter
 */
function doFilter(filterString:string, characters:Map<string, CharacterEntry>, element:HTMLElement):void {
    const id = element.dataset.id;
    if (!id) {return;}
    const character = characters.get(id);
    if (!character) {return;}
    if (passesFilter(filterString, character)) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

/** test a character against the filter */
function passesFilter(filterString:string, entry:CharacterEntry):boolean {
    if (!filterString) {return true;}
    filterString = filterString.toLowerCase();
    for (const haystack of Object.values(entry)){
        if (typeof haystack === 'string') {
            if (-1 !== haystack.toLowerCase().indexOf(filterString)) {return true;}
        }
    }
    return false;
}
