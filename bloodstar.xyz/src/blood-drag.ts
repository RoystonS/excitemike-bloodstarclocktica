type RenderFn = (itemData:unknown)=>Element;
type CleanupFn = (listElement:HTMLElement)=>void;
type ItemDragData = {
    element:HTMLElement,
    itemData:unknown,
    list:HTMLElement,
    listData:unknown[],
    renderItemFn:RenderFn,
    cleanupItemFn:CleanupFn
};
let gDragged:ItemDragData|null = null;
let gDraggedOver:ItemDragData|null = null;

const cleanups = new Map<HTMLElement, CleanupFn>();

/// clean up after a renderItems
function clearItems(listElement:HTMLElement):void {
    const cleanupFn = cleanups.get(listElement);
    if (cleanupFn) {
        cleanupFn(listElement);
        cleanups.delete(listElement);
    }
    listElement.innerText = '';
}

export function renderItems(list:HTMLElement, data:unknown[], renderItemFn:RenderFn, cleanupItemFn:CleanupFn):void {
    clearItems(list);
    data.forEach((itemData, index) => {
        const li = document.createElement('li');
        li.draggable = true;
        const itemDragData:ItemDragData = {
            element:li,
            itemData,
            list,
            listData:data,
            renderItemFn,
            cleanupItemFn
        };
        li.dataset.index = String(index);
        li.addEventListener('drag', ()=>dragBegin(itemDragData));
        li.addEventListener('dragover', e=>dragOver(e, itemDragData));
        li.addEventListener('drop', ()=>dragEnd());
        li.appendChild(renderItemFn(itemData));
        list.appendChild(li);

        // remember how to clean up
        cleanups.set(li, cleanupItemFn);
    });
}

const dragBegin = (itemDragData:ItemDragData) => {
    gDragged = itemDragData;
};

const dragOver = (e:DragEvent, itemDragData:ItemDragData) => {
    e.preventDefault();
    gDraggedOver = itemDragData;
};

const dragEnd = () => {
    try {
        if (!gDragged || !gDraggedOver) {
            return;
        }
        const {
            element:draggedElement,
            itemData:draggedItemData,
            list:draggedItemList,
            listData:draggedListData,
            renderItemFn,
            cleanupItemFn
        } = gDragged;
        
        if (!draggedElement.dataset.index ) {
            return;
        }
        const fromIndex = parseInt(draggedElement.dataset.index, 10);

        const {
            element:draggedOverElement,
            list:draggedOverItemList,
        } = gDraggedOver;
        if (!draggedOverElement.dataset.index) {
            return;
        }
        const toIndex = parseInt(draggedOverElement.dataset.index, 10);
    
        if (draggedItemList !== draggedOverItemList) {
            return;
        }
        if (fromIndex === toIndex) {
            return;
        }
        draggedListData.splice(fromIndex, 1);
        draggedListData.splice(toIndex, 0, draggedItemData);
    
        gDragged = null;
        gDraggedOver = null;
        renderItems(draggedItemList, draggedListData, renderItemFn, cleanupItemFn);
    } finally {
        gDragged = null;
        gDraggedOver = null;
    }
}
