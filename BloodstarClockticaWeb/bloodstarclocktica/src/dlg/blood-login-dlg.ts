/**
 * dialog to prompt for username and password
 * @module BloodLogin
 */
import * as BloodDlg from './blood-dlg';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let messageArea:HTMLElement|null = null;
let usernameBox:HTMLInputElement|null = null;
let passwordBox:HTMLInputElement|null = null;

const errorResult = {username:'',password:''};

export type UserPass = {username:string,password:string};

/** pull results out of text fields */
async function getResult():Promise<UserPass> {
    if (!usernameBox) { return errorResult; }
    if (!passwordBox) { return errorResult; }
    return {
        username: usernameBox.value,
        password: passwordBox.value,
    };
}

/** prepare the dialog for use */
function init() {
    if (initted) { return; }
    initted = true;

    const grid = document.createElement('div');
    grid.className = 'twoColumnGrid';

    messageArea = document.createElement('p');

    {
        const usernameLabel = document.createElement('label');
        usernameLabel.innerText = 'Username';
        usernameLabel.htmlFor = 'login-dlg-username';

        usernameBox = document.createElement('input');
        usernameBox.type = 'text';
        usernameBox.required = true;
        usernameBox.id = 'login-dlg-username';

        grid.appendChild(usernameLabel);
        grid.appendChild(usernameBox);
    }

    {
        const passwordLabel = document.createElement('label');
        passwordLabel.innerText = 'Password';
        passwordLabel.htmlFor = 'login-dlg-password';

        passwordBox = document.createElement('input');
        passwordBox.type = 'password';
        passwordBox.required = true;
        passwordBox.id = 'login-dlg-password';

        grid.appendChild(passwordLabel);
        grid.appendChild(passwordBox);
    }
    
    const buttons:BloodDlg.ButtonCfg[] = [
        {label:'Ok', callback:getResult}
    ];
    ;({open:showFn, close:closeFn} = BloodDlg.init('login-dlg', [messageArea, grid], buttons));
}

/** bring up the popup to ask for username and password */
export async function show(prompt:string):Promise<UserPass|null> {
    if (!initted) { init(); }
    if (!showFn) { return null; }
    if (!messageArea) { return null; }
    if (!usernameBox) { return null; }
    if (!passwordBox) { return null; }

    messageArea.innerText = prompt;
    usernameBox.value = '';
    passwordBox.value = '';

    return await showFn();
}

/** close the popup early */
export function close(result:any):void {
    if (!closeFn) { return; }
    closeFn(result);
}
