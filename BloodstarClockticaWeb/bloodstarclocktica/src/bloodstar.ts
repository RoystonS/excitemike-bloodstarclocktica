import * as BloodBind from './bind/bindings';
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import {showError} from "./dlg/blood-message-dlg";
import * as BloodIO from "./blood-io";
import {Character} from "./model/character";
import {Edition} from "./model/edition";
import {initNightOrderBindings} from './night-order';
import {hookupClickEvents} from './util';
import * as CharacterTab from './character-tab';
import { ProcessImageSettings } from './blood-image';
import Images from './images';
import { bindCharacterList } from './character-list';
import { BloodTeam } from './model/blood-team';
import publish from './commands/publish';
import {save, saveAs} from './commands/save';
import {chooseAndDeleteFile} from './commands/delete';
import login from './commands/login';
import importOfficial from './import/official';
import './styles/autogrowtextarea.css';
import './styles/characterlist.css';
import './styles/charactertab.css';
import './styles/dialog.css';
import './styles/dragdrop.css';
import './styles/main.css';
import './styles/menu.css';
import './styles/nightorder.css';
import './styles/scrollbars.css';
import './styles/slider.css';
import './styles/tabs.css';
import './styles/teamcolor.css';

let edition:Edition = new Edition();
let auth = '';
const selectedCharacter = new BloodBind.Property<Character|null>(null);

/** add a new character to the custom edition */
async function addCharacterClicked():Promise<void> {
    await edition.addNewCharacter();
}

/** clicked the help menu button */
function showHelp() {
    // TODO: implement showHelp
    void showError('Not yet implemented', '`showHelp` Not yet implemented');
}

/**
 * maintain a list of recent files - both in the menu and in local storage
 * @param name file name
 */
function setRecentFile(name:string):void {
    try {
        const localStorage = window.localStorage;
        if (!localStorage) {return;}
        localStorage.setItem('recentFile',name);
    } catch {
        // ignore
    }
}

/**
 * If a file turns out to be deleted or renamed or something, delete the old
 * name from the list
 * @param name file name to remove
 */
function clearRecentFile(name:string):void {
    try {
        const localStorage = window.localStorage;
        if (!localStorage) {return;}
        const file = localStorage.getItem('recentFile');
        if (file!==name) {return;}
        localStorage.removeItem('recentFile');
    } catch {
        // ignore
    }
}

/**
 * if a last-opened file is remembered, get its name
 * otherwise, return the empty string
 */
function getRecentFile():string {
    try {
        const localStorage = window.localStorage;
        if (!localStorage) {return '';}
        return localStorage.getItem('recentFile') || '';
    } catch {
        // ignore
    }
    return '';
}

/**
 * user chose to open a new file
 */
export async function newFileClicked():Promise<boolean> {
    try {
        await BloodIO.newEdition(edition);
    } catch (error) {
        await showError('Error', 'Something went wrong when creating new file', error);
    }
    return true;
}

/**
 * user chose to open a file
 */
export async function openFileClicked():Promise<boolean> {
    if (await BloodIO.open(auth, edition)) {
        setRecentFile(edition.saveName.get());
        return true;
    }
    return false;
}

/** menu item for delete clicked */
export async function deleteFileClicked():Promise<boolean> {
    const deleted = await chooseAndDeleteFile(auth);
    if (!deleted) {return false;}
    clearRecentFile(deleted);
    return true;
}

/**
 * user chose to save the current file
 */
export async function saveFileClicked():Promise<boolean> {
    if (await save(auth, edition)) {
        setRecentFile(edition.saveName.get());
        return true;
    }
    return false;
}

/**
 * user chose to save the current file under a new name
 */
export async function saveFileAsClicked():Promise<boolean> {
    if (await saveAs(auth, edition)) {
        setRecentFile(edition.saveName.get());
        return true;
    }
    return false;
}

/** user chose to import official character(s) */
async function importOfficialClicked():Promise<boolean> {
    try {
        return await importOfficial(edition);
    } catch (error) {
        await showError('Error', 'Something went wrong when trying to clone official character', error);
        throw error;
    }
}

/** user chose to save and publish */
async function saveAndPublishClicked():Promise<boolean> {
    if (!edition.dirty.get() || await saveFileClicked()) {
        await publish(auth, edition);
    }
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

/** initialize listeners and data bindings */
async function initBindings():Promise<void> {
    window.addEventListener('beforeunload',(event):string|void=>{
        if (!edition.dirty.get()){return;}
        event.preventDefault();
        const message = "Are you sure you want to leave? Unsaved changes will be lost.";
        event.returnValue = message;
        return message;
    });

    document.addEventListener('keydown', async (e) => {
        if (e.ctrlKey) {
            if (e.code === "KeyS") {
                e.preventDefault();
                await save(auth, edition);
            }
        }
    });
    hookupClickEvents([
        ['addCharacterButton', addCharacterClicked],
        ['newFileButton', newFileClicked],
        ['openFileButton', openFileClicked],
        ['deleteFileButton', deleteFileClicked],
        ['saveFileButton', saveFileClicked],
        ['saveFileAsButton', saveFileAsClicked],
        ['importBlood', ()=>edition && BloodIO.importBlood(edition)],
        ['importOfficialButton', importOfficialClicked],
        ['jsonFromUrlButton', ()=>edition && BloodIO.importJsonFromUrl(edition)],
        ['jsonFromFileButton', ()=>edition && BloodIO.importJsonFromFile(edition)],
        ['saveAndPublishButton', saveAndPublishClicked],
        ['helpButton', showHelp],
        ['metaTabBtn', ()=>tabClicked('metaTabBtn','metatab')],
        ['charTabBtn', ()=>tabClicked('charTabBtn','charactertab')],
        ['firstNightTabBtn', ()=>tabClicked('firstNightTabBtn','firstNightOrderTab')],
        ['otherNightTabBtn', ()=>tabClicked('otherNightTabBtn','otherNightOrderTab')],
        ['metaLogoRemoveBtn', ()=>edition && edition.meta.logo.set(null)]
    ]);

    BloodBind.bindTextById('windowTitle', edition.windowTitle);
    BloodBind.bindTextById('metaName', edition.meta.name);
    BloodBind.bindTextById('metaAuthor', edition.meta.author);
    BloodBind.bindTextById('metaSynopsis', edition.almanac.synopsis);
    BloodBind.bindTextById('metaOverview', edition.almanac.overview);
    BloodBind.bindImageChooserById('metaLogoInput', edition.meta.logo, ProcessImageSettings.FULL_WIDTH, ProcessImageSettings.FULL_HEIGHT);
    BloodBind.bindImageDisplayById('metaLogoDisplay', edition.meta.logo);
    
    {
        const tokenBackground = document.getElementById('tokenBackground');
        if (tokenBackground instanceof HTMLImageElement) {
            tokenBackground.src = Images.TOKEN_URL;
            BloodBind.bindVisibility(tokenBackground, edition.previewOnToken);
        }
        const curvedCharacterText = document.getElementById('curvedCharacterNameHolder');
        if (curvedCharacterText) {
            BloodBind.bindVisibility(curvedCharacterText, edition.previewOnToken);
        }
    }

    bindCharacterList('characterList', edition.characterList, selectedCharacter);

    await initNightOrderBindings(edition);
    
    // tie selected character to character tab
    selectedCharacter.addListener(v=>{
        CharacterTab.setSelectedCharacter(v);
        if (v) {
            tabClicked('charTabBtn','charactertab');
        }
    });
    await selectedCharacter.set(edition.characterList.get(0) || null);

    BloodBind.bindCheckboxById('previewOnToken', edition.previewOnToken);

    edition.addPropertyChangedEventListener(key => {
        if (key === 'characterList') {
            updateStatusbar();
        }
    });
    updateStatusbar();
}

/** initialize CustomEdition object to bind to */
async function initCustomEdition():Promise<void> {
    try {
        const rememberedFile = getRecentFile();
        if (rememberedFile) {
            if (await BloodIO.open(auth, edition, rememberedFile, true)) {
                return;
            }
            clearRecentFile(rememberedFile);
        }

        // eslint-disable-next-line no-empty
        while (!await BloodNewOpen.show()) {
        }
    } catch (e) {
        console.error(e);
        if (edition) { await edition.reset(); }
        await showError('Error', 'Error encountered during initialization', e);
    }
}

/** prepare app */
async function init() {
    edition = await Edition.asyncNew();

    await initBindings();

    // need to get login info before we can do much of anything
    auth = await login();

    await initCustomEdition();
}

type StatusBarData = Map<string, {id:string,exported:number,total:number}>;

/** update status bar text */
function collectStatusBarData():StatusBarData {
    const data:StatusBarData = new Map();
    data.set('all', {id:'charactersStatus',exported:0,total:0});
    data.set(BloodTeam.TOWNSFOLK, {id:'townsfolkStatus',exported:0,total:0});
    data.set(BloodTeam.OUTSIDER, {id:'outsidersStatus',exported:0,total:0});
    data.set(BloodTeam.MINION, {id:'minionsStatus',exported:0,total:0});
    data.set(BloodTeam.DEMON, {id:'demonsStatus',exported:0,total:0});
    data.set(BloodTeam.TRAVELER, {id:'travelersStatus',exported:0,total:0});
    data.set(BloodTeam.FABLED, {id:'fabledStatus',exported:0,total:0});
    if (edition){
        for (const character of edition.characterList) {
            const exported = character.export.get();
            for (const teamKey of ['all', character.team.get()]) {
                const teamData = data.get(teamKey);
                if (!teamData) {continue;}
                teamData.total++;
                if (exported) {
                    teamData.exported++;
                }
            }
        }
    }
    return data;
}

/** update status bar text */
function updateStatusbar():void {
    for (const {id,exported,total} of collectStatusBarData().values()) {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = `${exported}/${total}`;
        }
    }
}

// wait for dom to load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    // `DOMContentLoaded` already fired
    
    // intentional floating promise
    void init();
}
