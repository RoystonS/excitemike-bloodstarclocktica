type Class = new (...args: any[]) => {};
export type PropertyChangedListener = (propName:string) => void;

/** mixing for watching for property changes */
export const ObservableObjectMixin = <TBase extends Class>(Base:TBase) => {
    class Observable extends Base {
        _propertyChangedListeners:PropertyChangedListener[] = [];

        /** register for updates when a property changes */
        addPropertyChangedEventListener(listener:PropertyChangedListener):void {
            this._propertyChangedListeners.push(listener);
        }
        /** unregister for updates when a property changes */
        removePropertyChangedEventListener(listener:PropertyChangedListener):void {
            this._propertyChangedListeners = this._propertyChangedListeners.filter(i=>i!==listener);
        }
        /** send out notificaiton of a property changing */
        notifyPropertyChangedEventListeners(propName:string):void {
            const backup = this._propertyChangedListeners.concat();
            backup.forEach(cb=>cb(propName));
        }
    }
    return Observable;
}

/** object you can watch for property changes */
export type ObservableObject = InstanceType<ReturnType<typeof ObservableObjectMixin>>;
