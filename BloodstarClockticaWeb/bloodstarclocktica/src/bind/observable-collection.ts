import {ObservableObject, PropKey, PropertyChangedListener} from './observable-object';

export type ObservableCollectionListener<T extends ObservableObject<T>> = (event:ObservableCollectionChangedEvent<T>)=>void;
export type ItemPropertyChangedListener<T> = (index:number, item:T, propName:PropKey<T>) => void;

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
export type ObservableCollectionChangedEvent<T extends ObservableObject<T>> = {
    /** the list in which the change occurred */
    list:ObservableCollection<T>,

    /** type of change which occurred */
    action:ObservableCollectionChangeAction,

    /** list of new items after the change */
    newItems:ReadonlyArray<T>,

    /** index at which the change occurred */
    newStartingIndex:number,

    /** items affected by a Replace, Remove, or Move action */
    oldItems:ReadonlyArray<T>,

    /** index at which a Move, Remove, or Replace action occurred */
    oldStartingIndex:number;
};

type ItemPlus<ItemType> = {
    listener:PropertyChangedListener<ItemType>,
    index:number,
    item:ItemType
};

/** observe a collection of things */
export class ObservableCollection<ItemType extends ObservableObject<ItemType>> implements Iterable<ItemType> {
    private items:ItemPlus<ItemType>[];
    private collectionChangedListeners:ObservableCollectionListener<ItemType>[];
    private itemChangedListeners:ItemPropertyChangedListener<ItemType>[];
    private itemCtor:()=>Promise<ItemType>;

    constructor(itemCtor:()=>Promise<ItemType>) {
        this.items = [];
        this.collectionChangedListeners = [];
        this.itemChangedListeners = [];
        this.itemCtor = itemCtor;
    }

    /** iterate */
    [Symbol.iterator]():Iterator<ItemType> {
        let index = 0;
        return {
            next:():IteratorResult<ItemType> => {
                if (index < this.items.length) {
                    return {value:this.items[index++].item, done:false};
                } else {
                    return { value:undefined, done: true };
                }
            }
        };
    }

    /** add an item to the end of the collection */
    async add(item:ItemType):Promise<void> {
        const itemPlus:ItemPlus<ItemType> = this.makeItemPlus(this.items.length, item);
        this.items.push(itemPlus);
        await this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Add,
            newItems: [item],
            newStartingIndex: this.items.length-1,
            oldItems: [],
            oldStartingIndex: -1
        });
    }

    /** add multiple items to the end of the collection */
    async addMany(items:ReadonlyArray<ItemType>):Promise<void> {
        const itemsPlus:ReadonlyArray<ItemPlus<ItemType>> = items.map(item=>this.makeItemPlus(this.items.length, item));
        const oldNumItems = this.items.length;
        this.items.push(...itemsPlus);
        this.updateIndices(oldNumItems);
        await this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Add,
            newItems: items,
            newStartingIndex: oldNumItems,
            oldItems: [],
            oldStartingIndex: -1
        });
    }

    /** remove all items */
    async clear():Promise<void> {
        const oldItems = this.items.map(i=>i.item);
        for (const itemPlus of this.items) {
            this.cleanupItemPlus(itemPlus);
        }
        this.items = [];
        await this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Remove,
            newItems: [],
            newStartingIndex: -1,
            oldItems: oldItems,
            oldStartingIndex: 0
        });
    }

    /** remove the specified item from the collection */
    async deleteItem(character:ItemType):Promise<void> {
        const i = this.indexOf(character);
        if (i < 0) { return; }
        await this.remove(i);
    }

    /** inverse of serialize */
    async deserialize(serialized:ReadonlyArray<{[key:string]:unknown}>):Promise<void> {
        await this.clear();
        const toAdd:ItemType[] = [];
        for (const itemData of serialized) {
            if ((itemData !== null) &&
                (typeof itemData !== 'string') &&
                (typeof itemData !== 'number') &&
                (typeof itemData !== 'boolean') &&
                !Array.isArray(itemData) ) {
                const item = await this.itemCtor();
                await item.deserialize(itemData);
                toAdd.push(item);
            }
        }
        await this.addMany(toAdd);
    }

    /** get an item in the collection */
    get(i:number):ItemType|null {
        const x = this.items[i];
        if (!x) {return null;}
        return this.items[i].item;
    }

    /** items in the collection */
    getItems(): ReadonlyArray<ItemType> { return this.items.map(i=>i.item); }

    /** find how many items are in the collection */
    getLength():number {
        return this.items.length;
    }

    /** where in the list the given item is, or -1 if not present */
    indexOf(item:ItemType):number {
        return this.items.findIndex(itemPlus=>itemPlus.item===item);
    }

    /** insert an item at the specified index */
    async insert(i:number, item:ItemType):Promise<void> {
        const itemPlus:ItemPlus<ItemType> = this.makeItemPlus(i, item);
        this.items.splice(i, 0, itemPlus);
        this.updateIndices(i+1);
        await this.notifyCollectionChangedListeners({
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
        return this.items.map(i=>f(i.item));
    }

    /** move the item from one index to another */
    async move(oldIndex:number, newIndex:number):Promise<void> {
        const item = this.items[oldIndex];
        this.items.splice(oldIndex, 1);
        this.items.splice(newIndex, 0, item);
        this.updateIndices(Math.min(oldIndex, newIndex));
        await this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Move,
            newItems: [],
            newStartingIndex: newIndex,
            oldItems: [],
            oldStartingIndex: oldIndex
        });
    }

    /** find value in the collection and swap it with the item after it, if any */
    async moveItemDown(value:ItemType):Promise<void> {
        const i = this.indexOf(value);
        if (i < 0) { return; }
        await this.move(i, i+1);
    }

    /** find value in the collection and swap it with the item before it, if any */
    async moveItemUp(value:ItemType):Promise<void> {
        const i = this.indexOf(value);
        if (i < 1) { return; }
        await this.move(i, i-1);
    }

    /** remove an item from the collection */
    async remove(i:number):Promise<void> {
        const itemPlus = this.items[i];
        this.cleanupItemPlus(itemPlus);
        this.items.splice(i, 1);
        this.updateIndices(i);
        await this.notifyCollectionChangedListeners({
            list: this,
            action: ObservableCollectionChangeAction.Remove,
            newItems: [],
            newStartingIndex: i,
            oldItems: [itemPlus.item],
            oldStartingIndex: i
        });
    }

    /** replace an item in the collection */
    async replace(i:number, newItem:ItemType):Promise<void> {
        const oldItem = this.items[i];
        if (newItem !== oldItem.item) {
            const oldItemPlus = this.items[i];
            this.cleanupItemPlus(oldItemPlus);
            const newItemPlus:ItemPlus<ItemType> = this.makeItemPlus(i, newItem);
            this.items[i] = newItemPlus;
            await this.notifyCollectionChangedListeners({
                list: this,
                action: ObservableCollectionChangeAction.Replace,
                newItems: [newItem],
                newStartingIndex: i,
                oldItems: [oldItemPlus.item],
                oldStartingIndex: i
            });
        }
    }

    /** 
     * add/replace/remove to replace the specified range with the passed-in array
     * After calling this, the collection will consist of
     *      items before `start`
     *      the passed-in items
     *      items that were at `end` or later
     * @param start zero based index at which to start replacing
     * @param end zero based index before which to stop
     * @param items items to insert where start was.
     */
    async replaceRange(start:number, end:number, items:ReadonlyArray<ItemType>):Promise<void> {
        if (end < start) {return;}

        const removedItemsPlus = this.items.slice(start, end);
        const removedItems = removedItemsPlus.map(itemPlus=>itemPlus.item);
        for (const itemPlus of removedItemsPlus){
            this.cleanupItemPlus(itemPlus);
        }
        const newItemsPlus = items.map((item,i)=>this.makeItemPlus(i+start, item));
        this.items.splice(start, end-start, ...newItemsPlus);
        this.updateIndices(start + newItemsPlus.length);

        const numReplaces = Math.min(end - start, items.length);
        if (numReplaces) {
            await this.notifyCollectionChangedListeners({
                list: this,
                action: ObservableCollectionChangeAction.Replace,
                newItems: items.slice(0, numReplaces),
                newStartingIndex: start,
                oldItems: removedItems.slice(0, numReplaces),
                oldStartingIndex: start
            });
        }

        const numRemoves = (end - start) - numReplaces;
        if (numRemoves) {
            await this.notifyCollectionChangedListeners({
                list: this,
                action: ObservableCollectionChangeAction.Replace,
                newItems: [],
                newStartingIndex: start + numReplaces,
                oldItems: removedItems.slice(numReplaces),
                oldStartingIndex: start + numReplaces
            });
        }

        const numAdds = items.length - numReplaces;
        if (numAdds) {
            await this.notifyCollectionChangedListeners({
                list: this,
                action: ObservableCollectionChangeAction.Add,
                newItems: items.slice(numReplaces),
                newStartingIndex: start + numReplaces,
                oldItems: [],
                oldStartingIndex: -1
            });
        }
    }

    /** convert to something that could be converted to JSON and/or read back with deserialize */
    serialize():unknown[] {
        return this.items.map(i=>i.item.serialize());
    }

    /** add/replace/remove to match the passed-in array */
    async set(items:ReadonlyArray<ItemType>):Promise<void> {
        await this.replaceRange(0, this.items.length, items);
    }

    /** listen to changes */
    addCollectionChangedListener(cb:ObservableCollectionListener<ItemType>):void {
        this.collectionChangedListeners.push(cb);
    }

    /** stop listening to changes */
    removeCollectionChangedListener(cb:ObservableCollectionListener<ItemType>):void {
        this.collectionChangedListeners = this.collectionChangedListeners.filter(i=>i!==cb);
    }

    /** clear all listeners */
    removeAllCollectionChangedListeners():void {
        this.collectionChangedListeners = [];
    }

    /** notify listeners of a change */
    private async notifyCollectionChangedListeners(event:ObservableCollectionChangedEvent<ItemType>):Promise<void> {
        return (await Promise.all(this.collectionChangedListeners.map(cb=>cb(event))))[0];
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
    addItemChangedListener(cb:ItemPropertyChangedListener<ItemType>):void {
        this.itemChangedListeners.push(cb);
    }

    /** stop listening to changes */
    removeItemChangedListener(cb:ItemPropertyChangedListener<ItemType>):void {
        this.itemChangedListeners = this.itemChangedListeners.filter(i=>i!==cb);
    }

    /** clear all listeners */
    removeAllItemChangedListeners():void {
        this.itemChangedListeners = [];
    }

    /** notify listeners of a change */
    private async notifyItemChangedListeners(itemPlus:ItemPlus<ItemType>, propName:PropKey<ItemType>):Promise<void> {
        return (await Promise.all(this.itemChangedListeners.map(
            cb=>cb(itemPlus.index, itemPlus.item, propName)
        )))[0];
    }

    /** wrap up an item with extra bookkeeping */
    private makeItemPlus(i:number, item:ItemType):ItemPlus<ItemType> {
        const itemPlus = {
            listener: (propName:PropKey<ItemType>)=>this.notifyItemChangedListeners(itemPlus, propName),
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