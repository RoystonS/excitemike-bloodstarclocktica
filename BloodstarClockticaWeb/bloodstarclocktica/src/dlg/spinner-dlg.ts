// 'please wait' style spinner popup for bloodstar clocktica
import * as BloodDlg from './blood-dlg';

let initted = false;
let showFn:BloodDlg.OpenFn|null = null;
let closeFn:BloodDlg.CloseFn|null = null;
let count = 0;
let messageArea:HTMLElement|null = null;

/// prepare the dialog for use
function init() {
    if (initted) { return; }
    initted = true;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    messageArea = document.createElement('span');
    
    ;({open:showFn, close:closeFn} = BloodDlg.init('spinner-dlg', [spinner, messageArea], []));
}

/// show the spinner until the promise resolves
export async function show<T>(message:string, somePromise:Promise<T>):Promise<T> {
    if (!initted) { init(); }
    if (!(showFn && closeFn && messageArea)) {throw new Error("no showFn");}

    messageArea.innerText = message;

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