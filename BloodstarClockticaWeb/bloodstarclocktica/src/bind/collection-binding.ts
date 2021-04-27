import {ObservableCollection, ObservableCollectionChangeAction, ObservableCollectionChangedEvent} from '../bind/observable-collection';
import {ObservableObject} from '../bind/observable-object';

export type RenderFn<T> = (itemData:T)=>Element;
export type CleanupFn = (renderedElement:Element)=>void;

export class CollectionBinding<T extends ObservableObject> {
    /** ol element this will keep in sync with the data */
    listElement:HTMLOListElement;

    /** collection we keep the DOM in sync with */
    collection:ObservableCollection<T>;
    
    /** how to create a DOM element for an item in the list */
    renderFn:RenderFn<T>;

    /** how to destroy a DOM element for an item in the list */
    cleanupFn:CleanupFn;

    /** what is being dragged */
    dragged:HTMLLIElement|null;

    /** constructor */
    constructor(listElement:HTMLOListElement, collection:ObservableCollection<T>, renderFn:RenderFn<T>, cleanupFn:CleanupFn) {
        this.listElement = listElement;
        this.collection = collection;
        this.renderFn = renderFn;
        this.cleanupFn = cleanupFn;
        this.dragged = null;

        collection.addCollectionChangedListener(()=>this.collectionChanged);
    }

    /** keep DOM in sync with collection changes */
    collectionChanged(value:ObservableCollectionChangedEvent<T>):void {
        switch (value.action) {
            case ObservableCollectionChangeAction.Add:
                this.insert(value.newStartingIndex, value.newItems);
                break;
            case ObservableCollectionChangeAction.Move:
                throw new Error("Not yet implemented");
                break;
            case ObservableCollectionChangeAction.Replace:
                throw new Error("Not yet implemented");
                break;
            case ObservableCollectionChangeAction.Remove:
                throw new Error("Not yet implemented");
                break;
        }
    }

    /** event handler for dragover */
    dragover(e:DragEvent) {
        if (!this.dragged) { return; }
        const target = e.target;
        if (!(target instanceof Element)) { return; }
        if (target === this.dragged) { return; }
        e.preventDefault();
        const insertAfter = (e.offsetY > 0.5 * target.getBoundingClientRect().height);
        if (insertAfter) {
            target.classList.remove('dropBefore');
            target.classList.add('dropAfter');
        } else {
            target.classList.remove('dropAfter');
            target.classList.add('dropBefore');
        }
    }
    
    /** event handler for dragleave */
    dragleave(e:DragEvent) {
        if (!this.dragged) { return; }
        const target = e.target;
        if (!(target instanceof Element)) { return; }
        if (target === this.dragged) { return; }
        target.classList.remove('dropBefore');
        target.classList.remove('dropAfter');
    }

    /** react to the end of a drag */
    drop(e:DragEvent):void {
        try {
            const target = e.target;
            if (!(target instanceof HTMLLIElement)) { return; }
            if (!this.dragged) { return; }
            if (target === this.dragged) { return; }
            e.preventDefault();

            const insertAfter = (e.offsetY > 0.5 * target.getBoundingClientRect().height);
            const indexOffset = insertAfter ? 1 : 0;

            // must be in the same list
            const sourceList = this.dragged.closest('ol');
            const destinationList = target.closest('ol');
            if (sourceList !== destinationList) { return; }

            if (!this.dragged.dataset.index ) { return; }
            const fromIndex = parseInt(this.dragged.dataset.index, 10);
            
            if (!target.dataset.index ) { return; }
            const toIndex = parseInt(target.dataset.index, 10) + indexOffset;

            // no change
            if (fromIndex === toIndex) { return; }

            // change the collection, our collection change listener will 
            // update the DOM to reflect the change
            this.collection.move(fromIndex, toIndex);

        } finally {
            this.dragged = null;
        }
    }

    /** create and insert DOM elements at the specified index */
    insert(i:number, items:T[]):void {
        for (const item of items) {
            const newChild = this.renderListItem(i, item);
            if (i === this.listElement.childNodes.length) {
                this.listElement.appendChild(newChild);
            } else {
                this.listElement.insertBefore(newChild, this.listElement.childNodes[i]);
            }
            i++;
        }
    }

    /** create DOM list item for a data item */
    renderListItem(i:number, itemData:T):Element {
        var li = document.createElement('li');
        li.draggable = true;
        li.dataset.index = String(i);
        li.addEventListener('drag', _ => this.dragged = li);
        li.addEventListener('dragover', e=>this.dragover(e));
        li.addEventListener('dragleave', e=>this.dragleave(e));
        li.addEventListener('drop', e => this.drop(e));
        li.appendChild(this.renderFn(itemData));

        return li;
    }

    /** cleanup */
    destroy() {
        this.collection.removeAllCollectionChangedListeners();

        if (this.cleanupFn) {
            for (let i=0; i<this.listElement.childNodes.length; ++i) {
                const child = this.listElement.childNodes[i];
                if (child instanceof HTMLElement) {
                    for (let j=0; j<child.childNodes.length; ++j) {
                        const renderedElement = child.childNodes[i];
                        if (renderedElement instanceof HTMLElement) {
                            this.cleanupFn(renderedElement);
                        }
                    }
                }
            }
        }
        this.listElement.innerText = '';

        this.dragged = null;
    }
}
