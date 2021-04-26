// newfile/openfile dialog for bloodstar clocktica
// TODO: rename to spinner-dlg
import * as BloodDlg from './blood-dlg';

let initted = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let count = 0;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    ;({open:showFn, close:closeFn} = BloodDlg.init('spinner-dlg', [spinner], []));
}

/// show the spinner until the promise resolves
export async function show<T>(somePromise:Promise<T>):Promise<T> {
    if (!initted) { init(); }

    if (!showFn) {throw new Error("no showFn");}
    if (!closeFn) {throw new Error("no closeFn");}

    ++count;
    if (1 === count) {
        // ignore result promise
        showFn();
    }
    try {
        return await somePromise;
    } finally {
        --count;
        if (0 === count) {
            closeFn(null);
        }
    }
}