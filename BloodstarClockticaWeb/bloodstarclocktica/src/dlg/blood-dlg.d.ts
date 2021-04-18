declare type ButtonCb = () => Promise<any>;
export declare type ButtonCfg = {
    label: string;
    callback: ButtonCb;
};
export declare function resolveDialog(element: HTMLElement, valueOrPromise: any): void;
export declare type OpenFn = () => Promise<any>;
export declare type CloseFn = (result: any) => void;
export declare function init(id: string, body: HTMLElement[], buttons: ButtonCfg[]): [OpenFn, CloseFn];
export {};
