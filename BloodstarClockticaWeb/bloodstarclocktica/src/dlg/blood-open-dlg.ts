// open dialog for bloodstar clocktica
import * as BloodDlg from './blood-dlg';
import * as Util from '../blood-util';

let initted:boolean = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let fileListDiv:HTMLElement|null = null;

/// user chose to cancel
function cancelClicked():Promise<any> {
    return Promise.resolve(null);
}

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'Choose an existing file to open:';
    fileListDiv = document.createElement('div');
    fileListDiv.className = 'open-dlg-list';
    
    const buttons:BloodDlg.ButtonCfg[] = [{label:'Cancel', callback:cancelClicked}];
    [showFn, closeFn] = BloodDlg.init('open-dlg', [message, fileListDiv], buttons);
}

/// update list of files
function repopulateFileList(fileList:string[]) {
    if (!fileListDiv) {return;}
    Util.removeAllChildNodes(fileListDiv);

    if (fileList.length === 0) {
        const span = document.createElement('span');
        span.innerText = 'No files found.';
        fileListDiv.appendChild(span);
    } else {
        for (const name of fileList) {
            const element = document.createElement('a');
            element.addEventListener('click', _=>BloodDlg.resolveDialog(element, name));
            element.innerText = name;
            fileListDiv.appendChild(element);
        }
    }
}

/// bring up dialog for picking whether to open an existing file or start a new one
/// returns a promise that resolves to a name, or null if the dialog was cancelled
export async function show() {
    if (!initted) { init(); }
    if (!showFn) { return; }

    const response = await fetch('https://www.meyermike.com/bloodstar/list.php', {
            method: 'POST',
            headers:{'Content-Type': 'application/json'}
        });
    const responseText = await response.text();
    const responseJson = JSON.parse(responseText);
    const {error,files} = responseJson;
    if (error) {
        throw new Error(error);
    }
    repopulateFileList(files);
    return await showFn();
}

/// take down the popup
export function close(result:any) {
    if (!closeFn) { return; }
    closeFn(result);
}