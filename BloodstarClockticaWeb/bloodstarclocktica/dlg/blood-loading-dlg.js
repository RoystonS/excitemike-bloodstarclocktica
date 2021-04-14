// newfile/openfile dialog for bloodstar clocktica
import * as BloodDlg from './blood-dlg.js';
import * as BloodOpenDlg from './blood-open-dlg.js';

let initted = false;
let showFn = null;
let closeFn = null;

/// user chose to open an existing file
async function openExisting() {
    const result = await BloodOpenDlg.show();
    // if cancelled, do another new-open dialog
    if (!result) {
        return await show();
    }
    return {openName:result};
}

/// user chose to create a new file
function createNew() {
    return {newName:'New Edition'};
}

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    [showFn, closeFn] = BloodDlg.init('new-open-dlg', [spinner], []);
}

/// show the spinner until the promise resolves
export async function show(somePromise) {
    if (!initted) { init(); }

    // ignore result promise
    showFn();
    try {
        await somePromise;
    } finally {
        closeFn();
    }
}