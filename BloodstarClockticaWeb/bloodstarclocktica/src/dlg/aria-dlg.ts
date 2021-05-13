/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Used to build custom dialogs.
 * See other modules in this folder for examples
 * @module AriaDialog
 */

import { appear, disappear } from "../animate";
import { createElement, CreateElementsOptions } from "../util";

type ResolveFn = (value:any)=>void;
type ButtonCb<T = unknown> = ()=>Promise<T>|T;
export type ButtonCfg<T = unknown> = {label:string,callback?:ButtonCb<T>};

/** used to make each dialog definitely have a unique id */
let unique = 1;

/** track all active dialogs */
const dialogStack:AriaDialog<unknown>[] = [];

/** used to globally disable focus blocking while we force focus */
let pauseFocusTrap = false;

/**
 * try to focus the node
 * @param node 
 * @returns whether focus was successfully set
 */
 function attemptFocus(node:Node):boolean {
    if (!isFocusable(node)) { return false; }
    pauseFocusTrap = true;
    try {
        (node as unknown as HTMLOrSVGElement).focus();
    } finally {
        pauseFocusTrap = false;
    }
    return document.activeElement === node;
}

/**
 * search tree under element and set focus on the first thing it can
 * @param node 
 * @returns true if focus was successfully set
 */
function focusFirstDescendant(node:Node):boolean {
    for (let i=0;i<node.childNodes.length;i++){
        const child = node.childNodes[i];
        if (attemptFocus(child) || focusFirstDescendant(child)) {
            return true;
        }
    }
    return false;
}

/**
 * search tree under element and set focus on the last thing it can
 * @param node 
 * @returns true if focus was successfully set
 */
function focusLastDescendant(node:Node):boolean {
    for (let i=node.childNodes.length-1;i>=0;i--){
        const child = node.childNodes[i];
        if (attemptFocus(child) || focusLastDescendant(child)) {
            return true;
        }
    }
    return false;
}

/** get the currently active dialog, if any */
function getCurrentDialog():AriaDialog<unknown>|null {
    return (dialogStack.length) ?
        dialogStack[dialogStack.length-1] :
        null;
}

/**
 * see if the node looks like a focusable element
 * @param node 
 * @returns 
 */
function isFocusable(node:Node):boolean {
    if (!node){return false;}
    const element = node as any;

    if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
        return true;
    }
  
    if (element.disabled) {
        return false;
    }
  
    switch (element.nodeName) {
      case 'A':
        return !!element.href && element.rel != 'ignore';
      case 'INPUT':
        return element.type != 'hidden' && element.type != 'file';
      case 'BUTTON':
      case 'SELECT':
      case 'TEXTAREA':
        return true;
      default:
        return false;
    }
}

// TODO: instead of returning nulls, dialog could take a cancel value in open func

/** base class for dialogs */
export class AriaDialog<ResultType> {
    private root:Element|null = null;
    private focusAfterClose:Element|null = null;
    private preNode:Node|null = null;
    private postNode:Node|null = null;
    private promise:Promise<ResultType|null>|null = null;
    private resolveFn:ResolveFn|null = null;
    private lastFocus:Node|null = null;

    /** whether escape can close the dialog */
    canCancel():boolean{return true;}

    /** close the dialog early. resolve result promise with specified value */
    close(value:unknown = null):void {
        if (!this.resolveFn){return;}
        this.resolveFn(value);

        // remove from dialog stack
        if (dialogStack.length) {
            const i = dialogStack.indexOf(this);
            if (i>=0) {
                dialogStack.splice(i,1);
                // if this was the current dialog
                // remove focus trap and restore focus
                if (i === dialogStack.length-1) {
                    this.removeFocusTrap();
                    if (i > 0) {
                        dialogStack[i-1].trapFocus();
                    }
                    if (this.focusAfterClose) {
                        (this.focusAfterClose as unknown as HTMLOrSVGElement).focus();
                    } else {
                        focusFirstDescendant(document.body);
                    }
                }
                // if this was the last one, restore body
                document.body.classList.remove('hasDialog');
            }
        }

        // remove from DOM
        if (!this.root) {return;}
        if (this.preNode) {
            this.root.parentNode?.removeChild(this.preNode);
            this.preNode = null;
        }
        if (this.postNode) {
            this.root.parentNode?.removeChild(this.postNode);
            this.postNode = null;
        }

        // intentional floating promise
        void disappear(this.root as HTMLElement);
    }

    /**
     * create DOM elements for dialog
     * @param debugName css id prefix for the dialog
     * @param body array of elements to append as dialog body
     * @param buttons buttons to add to the dialog
     */
    private createDialog(
        debugName:string,
        body:CreateElementsOptions = [],
        buttons:ButtonCfg[] = [{label:'OK'}]
    ):Element {
        const id = `${debugName}${unique++}`;
        const root = document.createElement('div');
        this.root = root;
        root.id = id;
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        const box = document.createElement('div');
        box.className = 'dialogBox';
    
        // add body elements to box
        for (const child of body) {
            if (child instanceof Node) {
                box.appendChild(child);
            } else {
                box.appendChild(createElement(child));
            }
        }
    
        // followed by buttons
        if (buttons.length) {
            const btnGroup = document.createElement('div');
            btnGroup.className = 'dialogBtnGroup';
        
            for (const {label, callback} of buttons) {
                const btn = document.createElement('button');
                btn.addEventListener('click', async () => {
                    const result = callback ? await callback() : null;
                    return this.close(result);
                });
                btn.innerText = label;
                btnGroup.appendChild(btn);
            }
            box.appendChild(btnGroup);
        }
    
        // box in dlg, dlg in document.
        root.appendChild(box);
        document.body.appendChild(root);

        // bracket the dialog in invisible, focusable nodes that we use to keep focus from leaving
        if (!root.parentNode){return root;}
        const preNode = document.createElement('div');
        this.preNode = root.parentNode.insertBefore(preNode, root);
        preNode.tabIndex = 0;
        const postNode = document.createElement('div');
        this.postNode = root.parentNode?.insertBefore(postNode, root.nextSibling);
        postNode.tabIndex = 0;

        return root;
    }

    /**
     * Open a dialog. await this.promise to get the result of the dialog.
     *  `var x = await (new Dialog(...)).result;`
     * @param focusAfterClose element or id of element to focus on after the dialog completes
     * @param debugName css id prefix for the dialog
     * @param body array of elements to append as dialog body
     * @param buttons buttons to add to the dialog
     * @returns promise that resolves to dialog result, or null
     */
    baseOpen(
        focusAfterClose:Element|string|null,
        debugName = '',
        body:CreateElementsOptions,
        buttons:ButtonCfg<ResultType|null>[] = [{label:'OK'}]
    ):Promise<ResultType|null> {
        this.root = this.createDialog(debugName, body, buttons);
        if (!this.root) {return Promise.resolve(null);}

        // we need to replace the previous dialog's listeners
        if (dialogStack.length > 0) {
            getCurrentDialog()?.removeFocusTrap();
        }

        if (typeof focusAfterClose === 'string') {
            this.focusAfterClose = document.getElementById(focusAfterClose);
        } else {
            this.focusAfterClose = focusAfterClose;
        }
        
        // disable scroll on body
        document.body.classList.add('hasDialog');

        // trap focus
        this.trapFocus();

        // this is the most recent dialog
        dialogStack.push(this);

        // result promise
        this.promise = new Promise<ResultType|null>((resolve)=>{
            this.resolveFn = resolve;
        });

        focusFirstDescendant(this.root);
        this.lastFocus = document.activeElement;

        appear(this.root as HTMLElement);

        return this.promise;
    }

    /** find the first element in the dialog with the given id */
    protected getElementById(id:string):HTMLElement|null {
        return this.root?.querySelector(`#${id}`)||null;
    }

    /** clear focus trap for this dialog */
    private removeFocusTrap():void {
        document.removeEventListener('focus', AriaDialog.staticTrapFocus, true);
    }

    /** force focus back if it goes outside of dialog */
    private static staticTrapFocus(event:FocusEvent):void{
        if (pauseFocusTrap) {return;}
        const dlg = getCurrentDialog();
        if (!dlg) {return;}
        if (!dlg.root) {return;}
        if (event.target && dlg.root.contains(event.target as Node)) {
            dlg.lastFocus = event.target as Node;
            return;
        }
        focusFirstDescendant(dlg.root);
        if (dlg.lastFocus === document.activeElement) {
            focusLastDescendant(dlg.root);
        }
        dlg.lastFocus = document.activeElement;
    }

    /** prevent focus from leaving the dialog */
    private trapFocus():void {
        document.addEventListener('focus', AriaDialog.staticTrapFocus, true);
    }
    
    /**
     * if the dialog is cancellable, close it
     * @returns whether it was closed
     */
    tryCancel():boolean {
        if (this.canCancel()) {
            this.close(null);
            return true;
        }
        return false;
    }
}

    /**
     * Open a dialog. await this.promise to get the result of the dialog.
     *  `var x = await (new Dialog(...)).result;`
     * @param focusAfterClose element or id of element to focus on after the dialog completes
     * @param debugName css id prefix for the dialog
     * @param body array of elements to append as dialog body
     * @param buttons buttons to add to the dialog
     * @returns promise that resolves to dialog result, or null
     */
export function showDialog<ResultType = unknown>(
        focusAfterClose:Element|string|null,
        debugName = '',
        body:CreateElementsOptions,
        buttons:ButtonCfg<ResultType|null>[] = [{label:'OK'}]
    ):Promise<ResultType|null>
{
    return new AriaDialog<ResultType>().baseOpen(focusAfterClose, debugName, body, buttons);
}


// escape to cancel current dialog
document.addEventListener('keyup', (event:KeyboardEvent) => {
    if (event.code !== 'Escape') {return;}
    const dlg = getCurrentDialog();
    if (!dlg) {return;}
    if (dlg.tryCancel()){
        event.stopPropagation();
    }
});
