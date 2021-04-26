// newfile/openfile dialog for bloodstar clocktica
import * as BloodDlg from './blood-dlg';

let initted = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    [showFn, closeFn] = BloodDlg.init('loading-dlg', [spinner], []);
}

/// show the spinner until the promise resolves
export async function show<T>(somePromise:Promise<T>):Promise<T> {
    if (!initted) { init(); }

    if (!showFn) {throw new Error("no showFn");}
    if (!closeFn) {throw new Error("no closeFn");}

    // ignore result promise
    showFn();
    try {
        return await somePromise;
    } finally {
        closeFn(null);
    }
}