/**
 * code to manage remembering last used file
 * @module RecentFile
 */

// TODO: make sure recent file is only used if the user matches

/**
 * If a file turns out to be deleted or renamed or something, delete the old
 * name from the list
 * @param name file name to remove
 */
export function clearRecentFile(name:string):void {
    try {
        const localStorage = window.localStorage;
        if (!localStorage) {return;}
        const file = localStorage.getItem('recentFile');
        if (file!==name) {return;}
        localStorage.removeItem('recentFile');
    } catch {
        // ignore
    }
}

/**
 * if a last-opened file is remembered, get its name
 * otherwise, return the empty string
 */
export function getRecentFile():string {
    try {
        const localStorage = window.localStorage;
        if (!localStorage) {return '';}
        return localStorage.getItem('recentFile') || '';
    } catch {
        // ignore
    }
    return '';
}

/**
 * maintain a list of recent files - both in the menu and in local storage
 * @param name file name
 */
export function setRecentFile(name:string):void {
    try {
        const localStorage = window.localStorage;
        if (!localStorage) {return;}
        localStorage.setItem('recentFile',name);
    } catch {
        // ignore
    }
}