/**
 * 'please wait' style spinner popup for bloodstar clocktica
 * @module SpinnerDlg
 */
import { createElement, CreateElementsOptions } from '../util';
import {AriaDialog} from './aria-dlg';

class SpinnerDialog extends AriaDialog<null> {
    private listElement:HTMLUListElement|null = null;
    private messages = new Map<string, {listItem:HTMLLIElement, stack:string[]}>();

    isOpen():boolean {return !!this.listElement;}

    private bumpListSize():void {
        if (!this.listElement){return;}
        if (!this.listElement.style.minWidth || (this.listElement.offsetWidth > Number.parseInt(this.listElement.style.minWidth))){
            this.listElement.style.minWidth = `${this.listElement.offsetWidth}px`;
        }
        if (!this.listElement.style.minHeight || (this.listElement.offsetHeight > Number.parseInt(this.listElement.style.minHeight))){
            this.listElement.style.minHeight = `${this.listElement.offsetHeight}px`;
        }
    }

    /** 
     * create or add to a spinner.
     * @returns a promise that resolves to a function for you to call when work completes */
    add(key:string, message:string):void {
        if (!this.listElement){
            this.open();
        }
        if (!this.listElement){return;}

        const entry = this.messages.get(key);
        if (!entry) {
            const listItem = this.listElement.appendChild(createElement({
                t:'li',
                txt:message,
                a:{tabindex:'0',role:'alert'}
            }));
            this.messages.set(key, {listItem,stack:[message]});
        } else {
            const {listItem,stack} = entry;
            stack.push(message);
            listItem.innerText = message;
        }
        this.bumpListSize();
    }

    /** undo add */
    remove(key:string, message:string):void {
        const entry = this.messages.get(key);
        if (!entry){return;}
        const {listItem,stack} = entry;
        const i = Array.prototype.lastIndexOf.call(stack, message);
        if (i<0){return;}

        // remove the message
        stack.splice(i,1);

        if (0===stack.length) {
            // no more messages for this key. remove list item and delete from map
            this.messages.delete(key);
            listItem.remove();
        } else if (i===stack.length) {
            // removed last item, change message
            listItem.innerText = stack[i-1];
        }

        // when the last message is gone, the whole spinner dialog can go away
        if (this.messages.size===0) {
            try {
                this.close(null);
            } finally {
                this.listElement = null;
            }
        }
    }

    /** create the spinner dialog */
    private open():void {
        this._canCancel = false;
        this.listElement = createElement({
            t:'ul',
            css:['spinnerMessages']
        });
        const body:CreateElementsOptions = [
            {t:'div',css:['spinner']},
            this.listElement
        ];

        // intentional floating promise
        void this.baseOpen(document.activeElement, 'spinner', body, []);
    }
}

const _spinner = new SpinnerDialog();

/**
 * show or add to a spinner until the given promise resolves
 * @param key category of message. only one message per key is shown at a time
 * @param message message to display while waiting
 * @param somePromise promise to spin during
 */
export async function spinner<T>(key:string, message:string, somePromise:Promise<T>):Promise<T> {
    _spinner.add(key, message);
    try {
        const result = await somePromise;
        _spinner.remove(key, message);
        return result;
    } finally {
        _spinner.remove(key, message);
    }
}