const LOCKED = 1;
const UNLOCKED = 0;
const INDEX = 0;
const NOTIFY_COUNT = 1;

/**
 * @see https://blogtitle.github.io/using-javascript-sharedarraybuffers-and-atomics/
 */
export class Mutex {
    private sab: SharedArrayBuffer;
    private mu: Int32Array;

    /**
     * Instantiate Mutex.
     * The mutex will use mutexSab as a backing array.
     * @param {SharedArrayBuffer} mutexSab
     */
    constructor(mutexSab: SharedArrayBuffer) {
        if (!mutexSab) {
            throw new Error("A Mutex SharedArrayBuffer is required");
        }
        this.sab = mutexSab;
        this.mu = new Int32Array(this.sab); // Int32 used for compatibility
    }

    /**
     * Instantiate a Mutex connected to the given one.
     * @param {Mutex} mu the other Mutex.
     */
    static connect(mu: Mutex) {
        return new Mutex(mu.sab);
    }

    /**
     * Lock an unlock resource
     * Compare Exchange atomically change the status from UNLOCKED to LOCKED
     * If the resouce is already locked then wait
     * @returns
     */
    lock() {
        for (;;) {
            if (
                Atomics.compareExchange(this.mu, INDEX, UNLOCKED, LOCKED) ==
                UNLOCKED
            ) {
                // compare atomically and it's free then set to locked and return
                return;
            }
            // else wait
            Atomics.wait(this.mu, INDEX, LOCKED);
        }
    }

    /**
     * Unlock a lock resource
     * Compare Exchange atomically change the status from LOCKED to UNLOCKED
     * If the resource is already unlocked then raise an error
     */
    unlock() {
        if (
            Atomics.compareExchange(this.mu, INDEX, LOCKED, UNLOCKED) != LOCKED
        ) {
            throw new Error(
                "Mutex is in inconsistent state: unlock on unlocked Mutex."
            );
        }
        // if the resource can be unlocked then notify
        Atomics.notify(this.mu, INDEX, NOTIFY_COUNT);
    }
}
