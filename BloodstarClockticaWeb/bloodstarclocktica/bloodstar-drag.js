const BloodstarDrag = function(){
    "use strict";

    let gDragged = null;
    let gDraggedOver = null;

    const renderItems = (list, data, renderItemFn) => {
        list.innerText = '';
        data.forEach((itemData, index) => {
            var li = document.createElement('li');
            li.draggable = true;
            const itemDragData = {
                element:li,
                itemData,
                list,
                listData:data,
                renderItemFn
            };
            li.dataset.index = index;
            li.addEventListener('drag', e=>dragBegin(itemDragData));
            li.addEventListener('dragover', e=>dragOver(e, itemDragData));
            li.addEventListener('drop', e=>dragEnd(itemDragData));
            li.appendChild(renderItemFn(itemData));
            list.appendChild(li);
        });
    };

    const dragBegin = (itemDragData) => {
        gDragged = itemDragData;
    };

    const dragOver = (e, itemDragData) => {
        e.preventDefault();
        gDraggedOver = itemDragData;
    };

    const dragEnd = (itemDragData) => {
        const {
            element:draggedElement,
            itemData:draggedItemData,
            list:draggedItemList,
            listData:draggedListData,
            renderItemFn
        } = gDragged;
        const fromIndex = draggedElement.dataset.index;
        const {
            element:draggedOverElement,
            list:draggedOverItemList,
        } = gDraggedOver;
        const toIndex = draggedOverElement.dataset.index;

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
        renderItems(draggedItemList, draggedListData, renderItemFn);
    }

    return {renderItems};
}();