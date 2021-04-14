// open dialog for bloodstar clocktica
import * as BloodDlg from './blood-dlg.js';
import * as Util from '../blood-util.js'

let initted = false;
let showFn = null;
let closeFn = null;
let fileListDiv = null;

/// user chose to cancel
function cancelClicked() {
    return null;
}

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const message = document.createElement('span');
    message.innerText = 'Choose an existing file to open:';
    fileListDiv = document.createElement('div');
    fileListDiv.className = 'open-dlg-list';
    
    const buttons = [['Cancel', cancelClicked]];
    [showFn, closeFn] = BloodDlg.init('open-dlg', [message, fileListDiv], buttons);
}

/// update list of files
function repopulateFileList(fileList) {
    Util.removeAllChildNodes(fileListDiv);

    if (fileList.length === 0) {
        const span = document.createElement('span');
        span.innerText = 'No files found.';
        fileListDiv.appendChild(span);
    } else {
        for (const name of fileList) {
            const element = document.createElement('a');
            element.addEventListener('click', (e)=>BloodDlg.resolveDialog(e.target, name));
            element.innerText = name;
            fileListDiv.appendChild(element);
        }
    }
}

/// bring up dialog for picking whether to open an existing file or start a new one
/// returns a promise that resolves to a name, or null if the dialog was cancelled
export async function show() {
    if (!initted) { init(); }

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
