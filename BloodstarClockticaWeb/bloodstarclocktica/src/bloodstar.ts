import * as BloodBind from './bind/bindings';
import * as BloodNewOpen from "./dlg/blood-new-open-dlg";
import * as SpinnerDlg from './dlg/spinner-dlg';
import * as LoginDlg from "./dlg/blood-login-dlg";
import {showError} from "./dlg/blood-message-dlg";
import * as BloodIO from "./blood-io";
import {Character} from "./model/character";
import {Edition} from "./model/edition";
import {initNightOrderBindings} from './night-order';
import {hookupClickEvents} from './util';
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
import { bindCharacterList } from './character-list';
import { BloodTeam } from './model/blood-team';

let edition:Edition|null = null;
let username = '';
let password = '';
const selectedCharacter = new BloodBind.Property<Character|null>(null);

// TODO: exceptions in promises need to surface somewhere (test without internet connection!)

/** add a new character to the custom edition */
async function addCharacterClicked():Promise<void> {
    if (!edition) {return;}
    await edition.addNewCharacter();
}

/** clicked the help menu button */
function showHelp() {
    // TODO: implement showHelp
    showError('Not yet implemented', '`showHelp` Not yet implemented');
}

/**
 * maintain a list of recent files - both in the menu and in local storage
 * @param name file name
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addToRecentFiles(_name:string):void {
    // TODO: implement addToRecentFiles
    updateRecentFilesMenu();
}

/**
 * If a file turns out to be deleted or renamed or something, delete the old
 * name from the list
 * @param name file name to remove
 */
//function removeFromRecentFiles(_name:string):void {
    // TODO: implement removeFromRecentFiles
//}

/**
 * update the recent files menu based on the recent files in local storage
 */
function updateRecentFilesMenu():void {
    // TODO: implement updateRecentFilesMenu
}

/**
 * user chose to open a new file
 */
export async function newFileClicked():Promise<boolean> {
    if (!edition) {return false;}
    await BloodIO.newEdition(edition);
    return true;
}

/**
 * user chose to open a file
 */
 export async function openFileClicked():Promise<boolean> {
    if (!edition) {return false;}
    if (await BloodIO.open(username, password, edition)) {
        addToRecentFiles(edition.saveName.get());
        return true;
    }
    return false;
}

/**
 * user chose to save the current file
 */
export async function saveFileClicked():Promise<boolean> {
    if (!edition) {return false;}
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
    if (!edition) {return false;}
    if (await BloodIO.saveAs(username, password, edition)) {
        addToRecentFiles(edition.saveName.get());
        return true;
    }
    return false;
}

/** user chose to import official character(s) */
async function importOfficialClicked():Promise<boolean> {
    // TODO: implement importOfficialClicked
    showError('Not yet implemented', '`importOfficialClicked` Not yet implemented');
    return false;
}

/** user chose to save and publish */
async function saveAndPublishClicked():Promise<boolean> {
    // TODO: implement saveAndPublishClicked
    showError('Not yet implemented', '`saveAndPublishClicked` Not yet implemented');
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
                const {username:newUsername, password:newPassword} = loginInfo;
                username = newUsername;
                password = newPassword;
                if (await SpinnerDlg.show('Logging in', BloodIO.login(username, password))) {
                    break;
                }
            }
        } catch (e) {
            console.error(e);
            showError('Error', 'Error encountered during login', e);
        }
    }
}

/** initialize listeners and data bindings */
async function initBindings():Promise<void> {
    if (!edition) {return;}

    window.onbeforeunload = function () {
        return "Are you sure you want to leave? Unsaved changes will be lost.";
    };

    document.onkeydown = (e) => {
        if (!edition) {return;}
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
        ['importBlood', ()=>edition && BloodIO.importBlood(edition)],
        ['importOfficialButton', importOfficialClicked],
        ['jsonFromUrlButton', ()=>edition && BloodIO.importJsonFromUrl(edition)],
        ['jsonFromFileButton', ()=>edition && BloodIO.importJsonFromFile(edition)],
        ['saveAndPublishButton', saveAndPublishClicked],
        ['helpbutton', showHelp],
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
        while (true) {
            if (await BloodNewOpen.show()) {
                break;
            }
        }
    } catch (e) {
        console.error(e);
        if (edition) { await edition.reset(); }
        showError('Error', 'Error encountered during initialization', e);
    }
}

/** prepare app */
async function init() {
    edition = await Edition.asyncNew();

    // need to get login info before we can do much of anything
    await login();

    await initCustomEdition();

    await initBindings();
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
    init();
}
