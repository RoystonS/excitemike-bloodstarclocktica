import {ObservableObject, PropertyChangedListener} from './observable-object';

export type ObservableCollectionListener<T> = (value:ObservableCollectionChangedEvent<T & ObservableObject>)=>void;
export type ItemPropertyChangedListener<T> = (index:number, item:T, propName:string) => void;

/** types of changes to ObservableCollections */
export enum ObservableCollectionChangeAction {
    /** an item was added to the collection */
    Add,

    /** an item was moved within the collection */
    Move,

    /** an item was removed from the collection */
    Remove,

    /** an item was replaced in the collection */
    Replace
}

/** describes the change in an ObservableCollection */
export type ObservableCollectionChangedEvent<T extends ObservableObject> = {
    /** the list in which the change occurred */
    list:ObservableCollection<T>,

    /** type of change which occurred */
    action:ObservableCollectionChangeAction,

    /** list of new items after the change */
    newItems:T[],

    /** index at which the change occurred */
    newStartingIndex:number,

    /** items affected by a Replace, Remove, or Move action */
    oldItems:T[],

    /** index at which a Move, Remove, or Replace action occurred */
    oldStartingIndex:number;
};

type ItemPlus<ItemType> = {
    listener:PropertyChangedListener,
    index:number,
    item:ItemType
};

/** observe a collection of things */
export class ObservableCollection<ItemType extends ObservableObject> implements Iterable<ItemType> {
    private items:ItemPlus<ItemType>[];
    private collectionChangedListeners:ObservableCollectionListener<ItemType>[];
    private itemChangedListeners:ItemPropertyChangedListener<ItemType>[];

    constructor() {
        this.items = [];
        this.collectionChangedListeners = [];
        this.itemChangedListeners = [];
    }

    /** iterate */
    [Symbol.iterator]():Iterator<ItemType> {
        let index = 0;
        return {
            next:(..._):IteratorResult<ItemType> => {
                if (index < this.items.length) {
                    return {value:this.items[index++].item, done:false};
                } else {
                    return { value:undefined, done: true };
                }
            }
        };
    }

    /** add an item to the end of the collection */
    add(item:ItemType):void {
        const itemPlus:ItemPlus<ItemType> = this.makeItemPlus(this.items.length, item);
        this.items.push(itemPlus);
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Add,
            newItems: [item],
            newStartingIndex: this.items.length-1,
            oldItems: [],
            oldStartingIndex: -1
        });
    }

    /** remove all items */
    clear():void {
        const oldItems = this.items.map(i=>i.item);
        for (const itemPlus of this.items) {
            this.cleanupItemPlus(itemPlus);
        }
        this.items = [];
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Remove,
            newItems: [],
            newStartingIndex: -1,
            oldItems: oldItems,
            oldStartingIndex: 0
        });
    }

    /** get an item in the collection */
    get(i:number):ItemType {
        return this.items[i].item;
    }

    /** items in the collection */
    getItems(): ReadonlyArray<ItemType> { return this.items.map(i=>i.item); }

    /** find how many items are in the collection */
    getLength():number {
        return this.items.length;
    }

    /** insert an item at the specified index */
    insert(i:number, item:ItemType):void {
        const itemPlus:ItemPlus<ItemType> = this.makeItemPlus(i, item);
        this.items.splice(i, 0, itemPlus);
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Add,
            newItems: [item],
            newStartingIndex: i,
            oldItems: [],
            oldStartingIndex: -1
        });
        this.updateIndices(i+1);
    }

    /** calls a callback on each item, returns array of results */
    map<ReturnType>(f:(x:ItemType)=>ReturnType):ReturnType[] {
        return this.items.map(i=>f(i.item));
    }

    /** move the item from one index to another */
    move(oldIndex:number, newIndex:number):void {
        const item = this.items[oldIndex];
        this.items.splice(oldIndex, 1);
        this.items.splice(newIndex, 0, item);
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Move,
            newItems: [],
            newStartingIndex: newIndex,
            oldItems: [],
            oldStartingIndex: oldIndex
        });
        this.updateIndices(Math.min(oldIndex, newIndex));
    }

    /** remove an item from the collection */
    remove(i:number):void {
        const itemPlus = this.items[i];
        this.cleanupItemPlus(itemPlus);
        this.items.splice(i, 1);
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Remove,
            newItems: [],
            newStartingIndex: i,
            oldItems: [itemPlus.item],
            oldStartingIndex: i
        });
        this.updateIndices(i);
    }

    /** replace an item in the collection */
    replace(i:number, newItem:ItemType) {
        const oldItem = this.items[i];
        if (newItem !== oldItem.item) {
            const oldItemPlus = this.items[i];
            this.cleanupItemPlus(oldItemPlus);
            const newItemPlus:ItemPlus<ItemType> = this.makeItemPlus(i, newItem);
            this.items[i] = newItemPlus;
            this.notifyCollectionChangedListeners({
                list: this,
                action: ObservableCollectionChangeAction.Replace,
                newItems: [newItem],
                newStartingIndex: i,
                oldItems: [oldItemPlus.item],
                oldStartingIndex: i
            });
        }
    }

    /** listen to changes */
    addCollectionChangedListener(cb:ObservableCollectionListener<ItemType>) {
        this.collectionChangedListeners.push(cb);
    }

    /** stop listening to changes */
    removeCollectionChangedListener(cb:ObservableCollectionListener<ItemType>) {
        this.collectionChangedListeners = this.collectionChangedListeners.filter(i=>i!==cb);
    }

    /** clear all listeners */
    removeAllCollectionChangedListeners() {
        this.collectionChangedListeners = [];
    }

    /** notify listeners of a change */
    private notifyCollectionChangedListeners(event:ObservableCollectionChangedEvent<ItemType>) {
        const backup = this.collectionChangedListeners.concat();
        backup.forEach(cb=>cb(event));
    }

    /**
     * when a range of items has out of date indices
     * @param begin - first index to update
     * @param end - one past the final index to update
     */
    private updateIndices(begin?:number, end?:number):void {
        if (begin === undefined) { begin = 0; }
        if (end === undefined) { end = this.items.length; }
        for (let i=begin; i<end; i++){
            this.items[i].index = i;
        }
    }

    /** listen to changes */
    addItemChangedListener(cb:ItemPropertyChangedListener<ItemType>) {
        this.itemChangedListeners.push(cb);
    }

    /** stop listening to changes */
    removeItemChangedListener(cb:ItemPropertyChangedListener<ItemType>) {
        this.itemChangedListeners = this.itemChangedListeners.filter(i=>i!==cb);
    }

    /** clear all listeners */
    removeAllItemChangedListeners() {
        this.itemChangedListeners = [];
    }

    /** notify listeners of a change */
    private notifyItemChangedListeners(itemPlus:ItemPlus<ItemType>, propName:string):void {
        const backup = this.itemChangedListeners.concat();
        backup.forEach(cb=>cb(itemPlus.index, itemPlus.item, propName));
    }

    /** wrap up an item with extra bookkeeping */
    private makeItemPlus(i:number, item:ItemType):ItemPlus<ItemType> {
        const itemPlus = {
            listener: (propName:string):void=>this.notifyItemChangedListeners(itemPlus, propName),
            index: i,
            item:item
        }
        item.addPropertyChangedEventListener(itemPlus.listener);
        return itemPlus;
    }

    /** clean up bookkeeping object */
    private cleanupItemPlus(itemPlus:ItemPlus<ItemType>):void {
        itemPlus.item.removePropertyChangedEventListener(itemPlus.listener);
    }
}