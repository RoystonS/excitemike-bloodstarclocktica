
/// clear out all children
export function removeAllChildNodes(parent:Node) {
    while (parent.firstChild) {
        if (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
    }
}