const locked = 1;
const unlocked = 0;

/**
 * @see https://blogtitle.github.io/using-javascript-sharedarraybuffers-and-atomics/
 */
export class Mutex {
    private _sab: SharedArrayBuffer;
    private _mu: Int32Array;

    /**
     * Instantiate Mutex.
     * The mutex will use mutexSab as a backing array.
     * @param {SharedArrayBuffer} mutexSab
     */
    constructor(mutexSab: SharedArrayBuffer) {
        if (!mutexSab) {
            throw new Error("A Mutex SharedArrayBuffer is required");
        }
        this._sab = mutexSab;
        this._mu = new Int32Array(this._sab); // Int32 used for compatibility
    }

    /**
     * Instantiate a Mutex connected to the given one.
     * @param {Mutex} mu the other Mutex.
     */
    static connect(mu: Mutex) {
        return new Mutex(mu._sab);
    }

    lock() {
        for (;;) {
            if (
                Atomics.compareExchange(this._mu, 0, unlocked, locked) ==
                unlocked
            ) {
                return;
            }
            Atomics.wait(this._mu, 0, locked);
        }
    }

    unlock() {
        if (Atomics.compareExchange(this._mu, 0, locked, unlocked) != locked) {
            throw new Error(
                "Mutex is in inconsistent state: unlock on unlocked Mutex."
            );
        }
        Atomics.notify(this._mu, 0, 1);
    }
}
