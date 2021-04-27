import {ObservableObject} from './observable-object';

export type ObservableCollectionListener<T> = (value:ObservableCollectionChangedEvent<T & ObservableObject>)=>void;

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

/** observe a collection of things */
export class ObservableCollection<ItemType extends ObservableObject> implements Iterable<ItemType> {
    private items:ItemType[];
    private listeners:ObservableCollectionListener<ItemType>[];
    constructor() {
        this.items = [];
        this.listeners = [];
    }

    /** iterate */
    [Symbol.iterator]():Iterator<ItemType> {
        let index = 0;
        return {
            next:(..._):IteratorResult<ItemType> => {
                if (index < this.items.length) {
                    return {value:this.items[index++], done:false};
                } else {
                    return { value:undefined, done: true };
                }
            }
        };
    }

    /** add an item to the end of the collection */
    add(item:ItemType):void {
        this.items.push(item);
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
        const oldItems = this.items;
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
        return this.items[i];
    }

    /** items in the collection */
    getItems(): ReadonlyArray<ItemType> { return this.items; }

    /** find how many items are in the collection */
    getLength():number {
        return this.items.length;
    }

    /** insert an item at the specified index */
    insert(i:number, item:ItemType):void {
        this.items.splice(i, 0, item);
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Add,
            newItems: [item],
            newStartingIndex: i,
            oldItems: [],
            oldStartingIndex: -1
        });
    }

    /** calls a callback on each item, returns array of results */
    map<ReturnType>(f:(x:ItemType)=>ReturnType):ReturnType[] {
        return this.items.map(f);
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
    }

    /** remove an item from the collection */
    remove(i:number):void {
        const item = this.items[i];
        this.items.splice(i, 1);
        this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Remove,
            newItems: [],
            newStartingIndex: i,
            oldItems: [item],
            oldStartingIndex: i
        });
    }

    /** replace an item in the collection */
    set(i:number, newItem:ItemType) {
        const oldItem = this.items[i];
        if (newItem !== oldItem) {
            this.items[i] = newItem;
            this.notifyCollectionChangedListeners({
                list: this,
                action: ObservableCollectionChangeAction.Replace,
                newItems: [newItem],
                newStartingIndex: i,
                oldItems: [oldItem],
                oldStartingIndex: i
            });
        }
    }

    /** listen to changes */
    addCollectionChangedListener(cb:ObservableCollectionListener<ItemType>) {
        this.listeners.push(cb);
    }

    /** stop listening to changes */
    removeCollectionChangedListener(cb:ObservableCollectionListener<ItemType>) {
        this.listeners = this.listeners.filter(i=>i!==cb);
    }

    /** clear all listeners */
    removeAllCollectionChangedListeners() {
        this.listeners = [];
    }

    /** notify listeners of a change */
    private notifyCollectionChangedListeners(event:ObservableCollectionChangedEvent<ItemType>) {
        const backup = this.listeners.concat();
        backup.forEach(cb=>cb(event));
    }
}