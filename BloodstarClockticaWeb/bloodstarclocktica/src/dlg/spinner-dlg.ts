/**
 * 'please wait' style spinner popup for bloodstar clocktica
 * @module SpinnerDlg
 */
import { CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

class SpinnerDialog<T> extends AriaDialog<T> {
    canCancel():boolean {return false;}

    async open(message:string, somePromise:Promise<T>):Promise<T|null> {
        const body:CreateElementsOptions = [
            {t:'div',css:['spinner']},
            {t:'span',a:{tabindex:'0',role:'alert'},txt:message}
        ];

        // TODO: special case spinners on top of spinners

        // do NOT await the dialog in this case
        this.baseOpen(document.activeElement, 'spinner', body, []);

        let result:T|null = null;
        try {
            result = await somePromise;
        } finally {
            this.close(result);
        }
        
        return result;
    }
}

/**
 * show a spinner until the given promise resolves
 * @param message message to display while waiting
 * @param somePromise promise to spin during
 */
export async function show<T>(message:string, somePromise:Promise<T>):Promise<T|null> {
    return await new SpinnerDialog<T>().open(message, somePromise);
}
