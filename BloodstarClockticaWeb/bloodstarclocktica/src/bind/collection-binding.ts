import {ObservableCollection, ObservableCollectionChangeAction, ObservableCollectionChangedEvent} from '../bind/observable-collection';
import {ObservableObject} from '../bind/observable-object';

export type RenderFn<T> = (itemData:T)=>Element;
export type CleanupFn<T> = (renderedElement:Element, itemData:T)=>void;

/** get a y coordinate for the mouse relative to some element */
function getRelativeY(event:MouseEvent, refElement:Element|null):number {
    let refY = 0;
    while (refElement instanceof HTMLElement) {
        refY += refElement.offsetTop - refElement.scrollTop;
        refElement = refElement.offsetParent;
    }
    return event.pageY - refY;
}

/** check whether the mouse position indicates to position the dropped item after the hovered item instead of before */
function checkInsertAfter(event:MouseEvent, refElement:Element):boolean {
    return getRelativeY(event, refElement) > 0.5 * refElement.getBoundingClientRect().height;
}

export class CollectionBinding<T extends ObservableObject> {
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

    /** constructor */
    constructor(listElement:HTMLOListElement, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn<T>) {
        this.listElement = listElement;
        this.collection = collection;
        this.renderFn = renderFn;
        this.cleanupFn = cleanupFn;
        this.dragged = null;

        collection.addCollectionChangedListener((e)=>this.collectionChanged(e));

        // sync DOM to current value
        this.clear();
        this.insert(0, collection.getItems());
    }

    /** keep DOM in sync with collection changes */
    private collectionChanged(value:ObservableCollectionChangedEvent<T>):void {
        switch (value.action) {
            case ObservableCollectionChangeAction.Add:
                this.insert(value.newStartingIndex, value.newItems);
                break;
            case ObservableCollectionChangeAction.Move:
                this.move(value.oldStartingIndex, value.newStartingIndex);
                break;
            case ObservableCollectionChangeAction.Replace:
                this.replace(value.newStartingIndex, value.newItems);
                break;
            case ObservableCollectionChangeAction.Remove:
                this.remove(value.oldStartingIndex, value.oldItems.length);
                break;
        }
    }

    /** check whether we are over a valid drop target */
    private dragVerify(e:DragEvent):boolean {
        // must be dragging something
        if (!this.dragged) { return false; }

        // must be over/dropping onto an element
        const target = e.target;
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

        // dragged item must have an index
        if (!this.dragged.dataset.index ) { return false; }
        const fromIndex = parseInt(this.dragged.dataset.index, 10);

        // hovered/dropped-onto item must have an index
        if (!listItemElement.dataset.index ) { return false; }
        const overIndex = parseInt(listItemElement.dataset.index, 10);

        // ignore if this location means no change
        if (listItemElement === this.dragged) { return false; }
        const insertAfter = checkInsertAfter(e, listItemElement);
        if (insertAfter && (fromIndex === overIndex+1)) { return false; }
        if (!insertAfter && (fromIndex === overIndex-1)) { return false; }

        return true;
    }

    /** event handler for dragover */
    private dragover(e:DragEvent) {
        if (!this.dragVerify(e)) { return; }
        const listItemElement = (e.target instanceof Element) && e.target.closest('li');
        if (!listItemElement) { return; }

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
        const listItemElement = (e.target instanceof Element) && e.target.closest('li');
        if (!listItemElement) { return; }
        listItemElement.classList.remove('dropBefore');
        listItemElement.classList.remove('dropAfter');
    }

    /** react to dropping a dragged item */
    private drop(e:DragEvent):void {
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
            this.collection.move(fromIndex, toIndex);

        } finally {
            if (e.target instanceof Element) {
                const listItemElement = e.target.closest('li');
                if (listItemElement)
                {
                    listItemElement.classList.remove('dropBefore');
                    listItemElement.classList.remove('dropAfter');
                }
            }

            this.dragged = null;
        }
    }

    /** dragging of an item began */
    private dragstart(e:DragEvent):void {
        if (e.target instanceof Element) {
            const listItemElement = e.target.closest('li');
            listItemElement?.classList.add('dragging');
        }
    }

    /** dragging ended on an item */
    private dragend(e:DragEvent):void {
        if (e.target instanceof Element) {
            const listItemElement = e.target.closest('li');
            listItemElement?.classList.remove('dragging');
        }
    }

    /** create and insert DOM elements at the specified index */
    private insert(i:number, items:ReadonlyArray<T>):void {
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
        this.updateIndices(Math.min(oldIndex, newIndex), Math.max(oldIndex, newIndex));
    }

    /** update DOM elements to new data */
    private replace(start:number, data:ReadonlyArray<T>):void {
        if (!data.length) {return;}
        if (start < 0) {return;}
        if (start >= this.listElement.childNodes.length) {return;}
        const n = data.length;

        for (let i=0; i<n; i++) {
            const oldChild = this.listElement.childNodes[start+i];
            this.cleanupListItem(oldChild);
            const newChild = this.renderListItem(i, data[i]);
            this.listElement.replaceChild(newChild, oldChild);
        }
    }

    /** remove DOM elements in the specified index range */
    private remove(start:number, numRemoved:number):void {
        if (numRemoved <= 0) {return;}
        if (start < 0) {return;}
        if (start >= this.listElement.childNodes.length) {return;}

        for (let i=start+numRemoved-1; i>=start; i--) {
            const child = this.listElement.childNodes[i];
            this.listElement.removeChild(child);
            this.cleanupListItem(child);
        }

        this.updateIndices(start);
    }

    /** create DOM list item for a data item */
    private renderListItem(i:number, itemData:T):Element {
        var li = document.createElement('li');
        li.draggable = true;
        li.dataset.index = String(i);
        li.addEventListener('drag', _ => this.dragged = li);
        li.addEventListener('dragstart', e=>this.dragstart(e));
        li.addEventListener('dragend', e=>this.dragend(e));
        li.addEventListener('dragover', e=>this.dragover(e));
        li.addEventListener('dragleave', e=>this.dragleave(e));
        li.addEventListener('drop', e => this.drop(e));
        li.appendChild(this.renderFn(itemData));

        return li;
    }

    /** keep dataset index in sync */
    private updateIndices(startPosition:number = 0, endPosition?:number):void {
        endPosition = (endPosition === undefined) ? this.listElement.childNodes.length : endPosition;
        for (let i=startPosition; i<endPosition; ++i) {
            const child = this.listElement.childNodes[i];
            if (child instanceof HTMLElement) {
                child.dataset.index = String(i);
            }
        }
    }

    /** cleanup */
    destroy() {
        this.collection.removeAllCollectionChangedListeners();
        this.clear();
        this.dragged = null;
    }

    /** cleanup whatever was done by renderListItem */
    private cleanupListItem(listItem:Node):void {
        if (!this.cleanupFn) { return; }
        if (!(listItem instanceof HTMLElement)) { return; }
        if (!listItem.dataset.index ) { return; }

        const index = parseInt(listItem.dataset.index, 10);
        const itemData = this.collection.get(index);

        const renderedElement = listItem.firstChild;
        if (renderedElement instanceof HTMLElement) {
            this.cleanupFn(renderedElement, itemData);
        }
    }

    /** remove any added elements */
    private clear():void {
        for (let i=0; i<this.listElement.childNodes.length; ++i) {
            const child = this.listElement.childNodes[i];
            this.cleanupListItem(child);
        }
        this.listElement.innerText = '';
    }
}
