/**
 * Helper for making sure asynchronous work doesn't overlap
 * @module Lock
 */

export type WorkCompleteFn = ()=>void;
type StartWorkFn = ((value:WorkCompleteFn)=>void);

/** Helper for making sure asynchronous work doesn't overlap */
export default class LockSet<KeyType> {
    private readonly locks = new Map<KeyType, StartWorkFn[]>();

    /** acquire a lock */
    private async acquire(key:KeyType):Promise<WorkCompleteFn> {
        const queue = this.locks.get(key) || this.locks.set(key, []).get(key) || [];
        const wasLocked = !!queue.length;

        // promise to block on before work is executed. resolves when previous work in queue completes
        const promise = new Promise<WorkCompleteFn>(resolve=>{
            queue.push(resolve);
        });

        // if we weren't already locked, it can run immediately
        if (!wasLocked) {this.runNext(key);}

        return promise;
    }

    /** queue up work to be run non-simultaneously with other queued work, but still asynchronous */
    async enqueue<T>(key:KeyType, work:()=>Promise<T>|T):Promise<T> {

        // wait for previous work to complete
        const workCompleteFn = await this.acquire(key);

        // run now, making sure we signal the end of work even if something goes wrong
        try {
            return await work();
        } finally {
            workCompleteFn();
        }
    }

    /** do blocked work */
    private runNext(key:KeyType):void {
        const queue = this.locks.get(key);
        if (!queue) {return;}
        const startWorkFn = queue[0];
        if (!startWorkFn) {return;}

        // send the callback, allowing work to start and 
        // provides the callback to be notified when it is done
        let released = false;
        startWorkFn(() => {
            if (released) {return;}
            released = true;

            // remove from queue to unlock next
            queue.shift();
            if (queue.length === 0) {this.locks.delete(key);} // don't hold on to keys we aren't using
            this.runNext(key);
        });
    }
}