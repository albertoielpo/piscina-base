const LOCKED = 1;
const UNLOCKED = 0;

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

    lock() {
        for (;;) {
            if (
                Atomics.compareExchange(this.mu, 0, UNLOCKED, LOCKED) ==
                UNLOCKED
            ) {
                return;
            }
            Atomics.wait(this.mu, 0, LOCKED);
        }
    }

    unlock() {
        if (Atomics.compareExchange(this.mu, 0, LOCKED, UNLOCKED) != LOCKED) {
            throw new Error(
                "Mutex is in inconsistent state: unlock on unlocked Mutex."
            );
        }
        Atomics.notify(this.mu, 0, 1);
    }
}
