/**
 * Work with the browser to manage states that the user can back out of.
 * @module StateHistory
 */

export type CurtainState = {type:'curtain';curtainId:string};
export type CbmState = {type:'cbm';listId:number;fromIndex:number};
export type HistoryState = CbmState | CurtainState | null;
type HistoryStateInternal = {depth:number; state:HistoryState; canGoForward:boolean};

export type StateChangeListener = (state:HistoryState)=>void;

/** state change listeners */
let listeners:StateChangeListener[] = [];

/** so we can tell if going forward or back */
let lastDepth = 0;

/** register to receive state changes */
export function addListener(listener:StateChangeListener):void {
    listeners.push(listener);
}

/** back out of all states */
export async function clear():Promise<void> {
    const depth:number = history.state?.depth ?? 0;
    if (depth > 0) {
        await new Promise(resolve=>{
            window.addEventListener('popstate', ()=>setTimeout(resolve, 1), {once:true});
            history.go(-depth);
        });
        // popstate listener takes it from here
    }
    lastDepth = 0;
}

/** check current state */
export function getState():HistoryState {
    const internalState:HistoryStateInternal|null = history.state;
    return internalState?.state ?? null;
}

/** get current depth based on history */
function depthFromHistory():number {
    return history.state?.depth ?? 0;
}

/** back up */
export async function pop():Promise<void> {
    if (depthFromHistory() > 0) {
        await new Promise(resolve=>{
            window.addEventListener('popstate', ()=>setTimeout(resolve, 1), {once:true});
            history.back();
        });
        // popstate listener takes it from here
    }
}

/** push state */
export async function pushState(state:HistoryState, canGoForward:boolean):Promise<void> {
    // clear first if the current state is not one we can go forward from
    const internalState0:HistoryStateInternal|null = history.state;
    if (internalState0?.canGoForward === false) {
        await clear();
    }

    // back up out of meaningless states
    const delta = depthFromHistory() - lastDepth;
    if (delta > 0) {
        await new Promise(resolve=>{
            window.addEventListener('popstate', ()=>setTimeout(resolve, 1), {once:true});
            history.go(-delta);
        });
    }

    // forward to new state
    lastDepth = 1 + depthFromHistory();
    const internalState1:HistoryStateInternal = {depth: lastDepth, state, canGoForward};
    history.pushState(internalState1, '');

    // pushState does NOT cause a popstate event. so we must call listeners here
    for (const listener of listeners.concat()) {
        listener(state);
    }
}

/** undo addListener */
export function removeListener(listener:StateChangeListener):void {
    listeners = listeners.filter(i => i!==listener);
}

/** clear history and go to state */
export async function setState(state:HistoryState, canGoForward:boolean):Promise<void> {
    const depth:number = depthFromHistory();
    if (depth > 0) {
        await new Promise(resolve=>{
            window.addEventListener('popstate', ()=>setTimeout(resolve, 1), {once:true});
            history.go(-depth);
        });
        // popstate listener takes it from here
    }
    return pushState(state, canGoForward);
}

/** watch for backing out of states */
window.addEventListener('popstate', (e:PopStateEvent)=>{
    const internalState:HistoryStateInternal|null = e.state;
    const newDepth = internalState?.depth ?? 0;
    if (newDepth < lastDepth) {
        lastDepth = newDepth;
        for (const listener of listeners.concat()) {
            listener(internalState?.state ?? null);
        }
    }
});

// always start in no special state at all
if (history.state !== null) {
    history.replaceState(null, '');
}
