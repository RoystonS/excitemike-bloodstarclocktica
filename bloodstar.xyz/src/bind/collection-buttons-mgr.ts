/**
 * Creates and manages buttons for managing the order of an observable collection
 * @module CollectionButtonsMgr
 */
import { arrayGet, createElement } from "../util";
import {show as getConfirmation} from "../dlg/yes-no-dlg";
import { showErrorNoWait } from "../dlg/blood-message-dlg";

type CollectionBinding<ItemType> = {
    forEachElement: (cb:(elem:HTMLElement, itemData:ItemType, i:number)=>void) => void;
    getElement: (i:number)=>HTMLElement|null;
    getIndex: (elem:HTMLElement)=>number;
};
type ObservableCollectionListener = (event:unknown)=>Promise<void>;
type ObservableCollection<ItemType> = {
    addCollectionChangedListener: (cb:ObservableCollectionListener)=>void;
    deleteItem: (character:ItemType)=>Promise<void>;
    move: (oldIndex:number, newIndex:number)=>Promise<void>;
    moveItemUp: (value:ItemType)=>Promise<void>;
    moveItemDown: (value:ItemType)=>Promise<void>;
    removeCollectionChangedListener: (cb:ObservableCollectionListener)=>void;
};

const MARKERATTRIBUTE = 'AddedByCollectionButtonsMgr';

export type CollectionButtonsMgrOptions<ItemType> = {
    /** customize delete confirmation message */
    deleteConfirmMessage?:((item:ItemType)=>string);
    /** what to do when the edit button is clicked */
    editBtnCb?: (item:ItemType)=>Promise<void>;
    /** whether to add a delete button */
    showDeleteBtn?:boolean;
    /** whether to add an edit button */
    showEditBtn?:boolean;
};

export class CollectionButtonsMgr<ItemType> {
    /** collection being edited */
    collection:ObservableCollection<ItemType>;

    /** collection being edited */
    collectionBinding:CollectionBinding<ItemType>;

    /** customize delete confirmation message */
    deleteConfirmMessage:((item:ItemType)=>string)|null;

    /** what to do when the edit button is clicked */
    editBtnCb: ((item:ItemType)=>Promise<void>)|null;

    /** index of the value being moved */
    index:number;

    /** whether we are in move mode */
    moving:boolean;

    /** remember for cleanup */
    collectionChangedListener:()=>Promise<void>;

    /** remember for cleanup */
    keyupListener:(e:KeyboardEvent)=>void;

    /** remember for cleanup */
    popstateListener:(e:PopStateEvent)=>void;

    /** whether to add a delete button */
    showDeleteBtn?:boolean;

    /** whether to add an edit button */
    showEditBtn?:boolean;

    /** prepare for use */
    constructor(
        binding:CollectionBinding<ItemType>,
        collection:ObservableCollection<ItemType>,
        options?:CollectionButtonsMgrOptions<ItemType>
    ) {
        this.collection = collection;
        this.collectionBinding = binding;
        this.deleteConfirmMessage = options?.deleteConfirmMessage??null;
        this.editBtnCb = options?.editBtnCb??null;
        this.index = -1;
        this.moving = false;
        this.showDeleteBtn = options?.showDeleteBtn??false;
        this.showEditBtn = options?.showEditBtn??false;

        // if the collection changes under us, cancel
        this.collectionChangedListener = async ()=>{this.cancelMove();};
        collection.addCollectionChangedListener(this.collectionChangedListener);

        // escape to back out of move mode
        this.keyupListener = (event:KeyboardEvent) => {
            if (event.code !== 'Escape') {return;}
            this.cancelMove();
        };
        document.addEventListener('keyup', this.keyupListener);

        // move mode can be backed out of
        this.popstateListener = () => {
            if (this.moving) {
                this._cancelMove();
            }
        };
        window.addEventListener('popstate', this.popstateListener);
    }

    /** clean up move mode */
    _cancelMove():void {
        if (this.moving) {
            this.moving = false;
            this.updateAllButtons();
        }
    }

    /** add a button to the element */
    static addButton(elem:HTMLElement, text:string, onclick:(e:MouseEvent)=>Promise<void>):void {
        const btn = createElement({t:'button', txt:text});
        btn.onclick = onclick;
        btn.setAttribute(MARKERATTRIBUTE, 'true');
        elem.append(btn);
    }

    /** add the delete item button */
    addDeleteButton(elem:HTMLElement, item:ItemType):void {
        CollectionButtonsMgr.addButton(elem, 'Delete', async () => {
            try {
                const confirmationMessage = this.deleteConfirmMessage ? this.deleteConfirmMessage(item) : 'Are you sure you want to delete this item?';
                if (await getConfirmation(
                    'Confirm Delete',
                    confirmationMessage
                )) {
                    await this.collection.deleteItem(item);
                }
            } catch (e: unknown) {
                showErrorNoWait('Error', 'Error encountered during deletion', e);
            }
        });
    }

    /** enter move mode */
    beginMove(i:number):void {
        if (this.moving) {return;}
        this.moving = true;
        this.index = i;
        this.updateAllButtons();

        // TODO: should probably merge with current state instead of clobbering
        // TODO: manually trigger popstate? (see https://stackoverflow.com/a/37492075)
        history.pushState(null, '');
    }

    /** back out of move mode */
    cancelMove():void {
        if (this.moving) {
            history.back();
        }
    }

    /** clear all added buttons from element */
    static clearButtons(elem:HTMLElement):void {
        const buttons = elem.getElementsByTagName('button');
        for (let i=buttons.length-1; i>=0; --i) {
            const button = arrayGet(buttons, i, null);
            if (button?.hasAttribute(MARKERATTRIBUTE)) {
                button.remove();
            }
        }
    }

    /** clean up */
    destroy():void {
        this.collection.removeCollectionChangedListener(this.collectionChangedListener);
        document.removeEventListener('keyup', this.keyupListener);
        window.removeEventListener('popstate', this.popstateListener);
    }

    /** do the move */
    async doMove(toElem:HTMLElement):Promise<void> {
        try {
            if (!this.moving) {return;}
            if (isNaN(this.index) || (this.index < 0)) {return;}
            const toIndex = this.collectionBinding.getIndex(toElem);
            if (isNaN(toIndex) || (toIndex < 0)) {return;}
            await this.collection.move(this.index, toIndex);
        } catch {
            this.cancelMove();
        }
    }

    /** check whether buttons have been added already */
    static hasButtons(elem:HTMLElement):boolean {
        return Boolean(elem.getElementsByTagName('button').length);
    }

    /** update buttons for the entire list */
    updateAllButtons():void {
        this.collectionBinding.forEachElement((elem:HTMLElement, itemData:ItemType, i:number)=>{
            this.updateButtons(elem, itemData, i);
        });
    }

    /** redo the row's buttons based on edit mode */
    updateButtons(elem:HTMLElement, itemData:ItemType, i:number):void {
        CollectionButtonsMgr.clearButtons(elem);

        if (this.moving) {
            if (this.index === i) {
                // this is the one being moved
                CollectionButtonsMgr.addButton(elem, 'Cancel Move', async ()=>{ this.cancelMove(); });
                return;
            }
            // place we can move to
            CollectionButtonsMgr.addButton(elem, 'Move Here', async ()=>this.doMove(elem));
            return;
        }

        if (this.showEditBtn) {
            const {editBtnCb} = this;
            if (editBtnCb) {
                CollectionButtonsMgr.addButton(elem, 'Edit', async ()=>editBtnCb(itemData));
            }
        }
        CollectionButtonsMgr.addButton(elem, 'Move', async ()=>{this.beginMove(i);});
        if (this.showDeleteBtn) {
            this.addDeleteButton(elem, itemData);
        }
    }
}
