import * as Animate from '../animate';
import {ObservableCollection, ObservableCollectionChangeAction, ObservableCollectionChangedEvent} from '../bind/observable-collection';
import {ObservableObject} from '../bind/observable-object';
import { isMobile } from '../bloodstar';

export type RenderFn<T extends ObservableObject<T>> = (itemData:T, collection:ObservableCollection<T>)=>Element;
export type CleanupFn<T> = (renderedElement:Element, itemData:T)=>void;

/** get a y coordinate for the mouse relative to some element */
function getRelativeY(event:MouseEvent, refElement:Element):number {
    const rect = refElement.getBoundingClientRect();
    return event.clientY - rect.y;
}

/** check whether the mouse position indicates to position the dropped item after the hovered item instead of before */
function checkInsertAfter(event:MouseEvent, refElement:Element):boolean {
    return getRelativeY(event, refElement) > 0.5 * refElement.getBoundingClientRect().height;
}

export class CollectionBinding<T extends ObservableObject<T>> {
    /** ol element this will keep in sync with the data */
    private listElement:HTMLOListElement;

    /** collection we keep the DOM in sync with */
    private collection:ObservableCollection<T>;

    /** how to create a DOM element for an item in the list */
    private renderFn:RenderFn<T>;

    /** how to destroy a DOM element for an item in the list */
    private cleanupFn:CleanupFn<T>;

    /** what is being dragged */
    private dragged:HTMLLIElement|null;

    /**
     * handling an edge case: when the user moves quickly, they might not get a dragleave/drop for every dragover that happened
     * this tracks the dragOvers so that they can all be cleaned up
     * */
    private dragOvers:Set<HTMLLIElement>;

    /** constructor */
    constructor(listElement:HTMLOListElement, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>) {
        this.listElement = listElement;
        this.collection = collection;
        this.renderFn = renderFn;
        this.cleanupFn = cleanupFn;
        this.dragged = null;
        this.dragOvers = new Set();

        collection.addCollectionChangedListener((e)=>{ this.collectionChanged(e); return Promise.resolve();});

        // sync DOM to current value
        this.clear();
        this.insert(0, collection.getItems());
    }

    /** any styles added for dragover events needs to get removed */
    cleanUpDragOverStyles():void {
        for (const elem of this.dragOvers) {
            elem.classList.remove('dropBefore');
            elem.classList.remove('dropAfter');
        }
        this.dragOvers.clear();
    }

    /** keep DOM in sync with collection changes */
    private collectionChanged(event:ObservableCollectionChangedEvent<T>):void {
        switch (event.action) {
            case ObservableCollectionChangeAction.Add:
                this.insert(event.newStartingIndex, event.newItems);
                break;
            case ObservableCollectionChangeAction.Move:
                this.move(event.oldStartingIndex, event.newStartingIndex);
                break;
            case ObservableCollectionChangeAction.Replace:
                this.replace(event.newStartingIndex, event.oldItems, event.newItems);
                break;
            case ObservableCollectionChangeAction.Remove:
                this.remove(event.oldStartingIndex, event.oldItems);
                break;
            default:
                throw new Error(`invalid action ${event.action}`);
        }
    }

    /** check whether we are over a valid drop target */
    private dragVerify(e:DragEvent):boolean {
        // must be dragging something
        if (!this.dragged) { return false; }

        // must be over/dropping onto an element
        const {target} = e;
        if (!(target instanceof Element)) { return false; }

        // must be in a listitem
        const listItemElement = target.closest('li');
        if (!listItemElement) { return false; }

        // dragged must be in a list
        const draggedList = this.dragged.closest('ol');
        if (draggedList !== this.listElement) { return false; }

        // hovered/dropped-onto item must be in the same list
        const overList = listItemElement.closest('ol');
        if (overList !== this.listElement) { return false; }

        return true;
    }

    /** event handler for dragover */
    private dragover(e:DragEvent) {
        if (!this.dragVerify(e)) { return; }
        if (!(e.target instanceof Element)) { return; }
        const listItemElement = e.target.closest('li');
        if (!listItemElement) { return; }

        this.dragOvers.add(listItemElement);

        e.preventDefault();
        if (checkInsertAfter(e, listItemElement)) {
            listItemElement.classList.remove('dropBefore');
            listItemElement.classList.add('dropAfter');
        } else {
            listItemElement.classList.remove('dropAfter');
            listItemElement.classList.add('dropBefore');
        }
    }

    /** event handler for dragleave */
    private dragleave(e:DragEvent) {
        if (!(e.target instanceof Element)) { return; }
        const listItemElement = e.target.closest('li');
        if (!listItemElement) { return; }

        this.cleanUpDragOverStyles();
    }

    /** react to dropping a dragged item */
    private async drop(e:DragEvent):Promise<void> {
        try {
            if (!this.dragVerify(e)) { return; }
            e.preventDefault();

            const listItemElement = e.target instanceof Element && e.target.closest('li');
            if (!listItemElement) { return; }
            if (!listItemElement.dataset.index) { return; }
            if (!this.dragged) { return; }
            if (!this.dragged.dataset.index) { return; }

            const fromIndex = parseInt(this.dragged.dataset.index, 10);
            const dropIndex = parseInt(listItemElement.dataset.index, 10);
            const insertAfter = checkInsertAfter(e, listItemElement);

            const toIndex = (dropIndex > fromIndex)
                ? (insertAfter ? dropIndex : dropIndex-1)
                : (insertAfter ? dropIndex+1 : dropIndex);

            // change the collection, our collection change listener will
            // update the DOM to reflect the change
            await this.collection.move(fromIndex, toIndex);

        } finally {
            this.cleanUpDragOverStyles();
            this.dragged = null;
        }
    }

    /** dragging of an item began */
    static dragstart(e:DragEvent):void {
        if (e.target instanceof Element) {
            const listItemElement = e.target.closest('li');
            if (!listItemElement) {return;}
            listItemElement.classList.add('dragging');
            Animate.shrinkOutMaxHeight(listItemElement);
        }
    }

    /** dragging ended on an item */
    static dragend(e:DragEvent):void {
        if (e.target instanceof Element) {
            const listItemElement = e.target.closest('li');
            if (!listItemElement) {return;}
            listItemElement.classList.remove('dragging');
            Animate.growInMaxHeight(listItemElement);
        }
    }

    /** create and insert DOM elements at the specified index */
    private insert(insertLocation:number, items:readonly T[]):void {
        let i = insertLocation;
        for (const item of items) {
            const newChild = this.renderListItem(i, item);
            if (i === this.listElement.childNodes.length) {
                this.listElement.appendChild(newChild);
            } else {
                this.listElement.insertBefore(newChild, this.listElement.childNodes[i]);
            }
            i++;
        }
        this.updateIndices(i);
    }

    /** change the order of items */
    private move(oldIndex:number, newIndex:number):void {
        if (oldIndex === newIndex) { return; }
        const node = this.listElement.childNodes[oldIndex];
        const refIndex = (newIndex > oldIndex) ? newIndex+1 : newIndex;
        if (refIndex >= this.listElement.childNodes.length) {
            this.listElement.appendChild(node);
        } else {
            const insertBeforeNode = this.listElement.childNodes[refIndex];
            this.listElement.insertBefore(node, insertBeforeNode);
        }
        this.updateIndices(Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex)+1);
    }

    /** update DOM elements to new data */
    private replace(start:number, oldData:readonly T[], newData:readonly T[]):void {
        if (!oldData.length) {return;}
        if (!newData.length) {return;}
        if (start < 0) {return;}
        if (start >= this.listElement.childNodes.length) {return;}
        const n = newData.length;

        for (let i=0; i<n; i++) {
            const oldChild = this.listElement.childNodes[start+i];
            this.cleanupListItem(oldChild, oldData[i]);
            const newChild = this.renderListItem(i, newData[i]);
            this.listElement.replaceChild(newChild, oldChild);
        }
    }

    /** remove DOM elements in the specified index range */
    private remove(start:number, oldItems:readonly T[]):void {
        const n = oldItems.length;
        if (n === 0) {return;}
        if (start < 0) {return;}
        if (start >= this.listElement.childNodes.length) {return;}

        for (let i=n-1; i>=0; i--) {
            const childIndex = i+start;
            const child = this.listElement.childNodes[childIndex];
            this.listElement.removeChild(child);
            this.cleanupListItem(child, oldItems[i]);
        }

        this.updateIndices(start);
    }

    /** create DOM list item for a data item */
    private renderListItem(i:number, itemData:T):Element {
        const li = document.createElement('li');
        li.draggable = true;
        li.dataset.index = String(i);
        if (!isMobile()) {
            li.addEventListener('drag', ()=>{this.dragged = li;});
            li.addEventListener('dragstart', CollectionBinding.dragstart);
            li.addEventListener('dragend', CollectionBinding.dragend);
            li.addEventListener('dragover', e=>{ this.dragover(e); });
            li.addEventListener('dragleave', e=>{ this.dragleave(e); });
            li.addEventListener('drop', async e => this.drop(e));
        }
        li.appendChild(this.renderFn(itemData, this.collection));

        return li;
    }

    /** keep dataset index in sync */
    private updateIndices(startPosition:number, endPosition?:number):void {
        const end = (endPosition === undefined) ? this.listElement.childNodes.length : endPosition;
        for (let i=startPosition; i<end; ++i) {
            const child = this.listElement.childNodes[i];
            if (child instanceof HTMLElement) {
                child.dataset.index = String(i);
            }
        }
    }

    /** cleanup */
    destroy():void {
        this.collection.removeAllCollectionChangedListeners();
        this.clear();
        this.dragged = null;
    }

    /** cleanup whatever was done by renderListItem */
    private cleanupListItem(listItem:Node, oldData:T):void {
        if (!(listItem instanceof HTMLElement)) { return; }
        if (!listItem.dataset.index ) { return; }

        const renderedElement = listItem.firstChild;
        if (renderedElement instanceof HTMLElement) {
            this.cleanupFn(renderedElement, oldData);
        }
    }

    /** remove any added elements */
    private clear():void {
        for (let i=0; i<this.listElement.childNodes.length; ++i) {
            const child = this.listElement.childNodes[i];
            const data = this.collection.get(i);
            if (!data) {continue;}
            this.cleanupListItem(child, data);
        }
        this.listElement.innerText = '';
    }
}
