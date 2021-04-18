declare type RenderFn = (itemData: any) => Element;
declare type CleanupFn = (listElement: HTMLElement) => void;
declare function renderItems(list: HTMLElement, data: any[], renderItemFn: RenderFn, cleanupItemFn: CleanupFn): void;
export declare const BloodDrag: {
    renderItems: typeof renderItems;
};
export {};
