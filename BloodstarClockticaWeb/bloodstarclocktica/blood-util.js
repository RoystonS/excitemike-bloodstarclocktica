
/// clear out all children
export function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}