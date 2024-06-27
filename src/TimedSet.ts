/**
 * A set like object that evicts entries from the set after they have been in there for the set time
 */
export interface ITimedSet<T> extends Set<T> {
    /**
     * Get the time left until this item is removed from the set
     */
    getTimeRemaining(key: T): number;

    /**
     * checks if this set is empty
     */
    isEmpty(): boolean;

    /**
     * Refresh the timeout for this element (resets the timer for the items eviction)
     *
     * @param key - Key
     */
    refresh(key: T): boolean;
}


/**
 * This set will evict items from the array after the set timeout.
 * This set can only contain unique items, items are unique when === is true
 */
export class TimedSet<T> implements ITimedSet<T> {
    private _map: Map<T, Timer>;

    /**
     * @param _timeOut - Timeout in milliseconds
     */
    constructor(private _timeOut: number) {
        if (Number.isNaN(_timeOut)) {
            throw new Error("Please supply a number");
        }

        this._map = new Map();
    }

    public get size(): number {
        return this._map.size;
    }

    /**
     * Get the raw underlying set backing this times array.
     */
    public get rawSet(): T[] {
        return [...this._map.keys()];
    }

    public get [Symbol.toStringTag](): string {
        return "Set";
    }

    public isEmpty(): boolean {
        return this._map.size === 0;
    }

    public add(key: T, timeoutOverload?: number): this {
        const timer = new Timer(() => {
            this._map.delete(key);
        }, timeoutOverload ?? this._timeOut);
        this._map.set(key, timer);
        return this;
    }

    public has(value: T): boolean {
        return this._map.has(value);
    }

    public delete(key: T): boolean {
        if (!this._map.has(key)) {
            return false;
        }

        const timeoutFunction = this._map.get(key) as Timer;
        timeoutFunction.clearTimer();
        return this._map.delete(key);
    }

    public refresh(key: T): boolean {
        if (!this._map.has(key)) {
            return false;
        }

        const timeoutFunction = this._map.get(key) as Timer;
        timeoutFunction.clearTimer();
        this.add(key);
        return true;
    }

    public clear(): void {
        for (const [, value] of this._map) {
            value.clearTimer();
        }

        this._map = new Map();
    }

    public [Symbol.iterator](): IterableIterator<T> {
        return this._map.keys();
    }

    public entries(): IterableIterator<[T, T]> {
        const keysArray = Array.from(this._map.keys());
        return keysArray.map(key => [key, key] as [T, T])[Symbol.iterator]();
    }

    public forEach(
        callbackfn: (value: T, value2: T, set: Set<T>) => void,
        thisArg?: unknown,
    ): void {
        this._map.forEach((_, key) => {
            callbackfn.call(thisArg, key, key, new Set(this._map.keys()));
        });
    }

    public keys(): IterableIterator<T> {
        return this._map.keys();
    }

    public values(): IterableIterator<T> {
        return this._map.keys();
    }

    public getTimeRemaining(key: T): number {
        const item = this._map.get(key);
        if (!item) {
            return -1;
        }
        return item.timeLeft;
    }

    public difference<U>(other: ReadonlySetLike<U>): Set<T> {
        const result = new Set(this.rawSet);
        const otherKeys = other.keys();
        let currentKey = otherKeys.next();

        while(!currentKey.done) {
            result.delete(currentKey.value as unknown as T);
            currentKey = otherKeys.next();
        }
        return result;
    }

    public intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
        const result = new Set<T & U>();
        const otherIterator = other.keys();
        let element = otherIterator.next();
        while (!element.done) {
            if (this._map.has(element.value as unknown as T)) {
                result.add(element.value as unknown as T & U);
            }
            element = otherIterator.next();
        }
        return result;
    }

    public isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
        const otherIterator = other.keys();
        let element = otherIterator.next();
        while (!element.done) {
            if (this._map.has(element.value as T)) {
                return false;
            }
            element = otherIterator.next();
        }
        return true;
    }

    public isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
        for (const elem of this._map.keys()) {
            if (!other.has(elem as unknown)) {
                return false;
            }
        }
        return true;
    }

    public isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
        const otherIterator = other.keys();
        let element = otherIterator.next();
        while (!element.done) {
            if (!this._map.has(element.value as T)) {
                return false;
            }
            element = otherIterator.next();
        }
        return true;
    }

    public symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
        const result = new Set<T | U>();

        const thisIterator = this._map.keys();
        let element = thisIterator.next();
        while (!element.done) {
            result.add(element.value as unknown as T | U);
            element = thisIterator.next();
        }

        const otherIterator = other.keys();
        let otherElement = otherIterator.next();
        while (!element.done) {
            if (result.has(otherElement.value as unknown as T | U)) {
                result.delete(otherElement.value as unknown as T | U);
            } else {
                result.add(otherElement.value as unknown as T | U);
            }
            otherElement = otherIterator.next();
        }

        return result;
    }

    public union<U>(other: ReadonlySetLike<U>): Set<T | U> {
        const unionSet = new Set<T | U>();

        const thisIterator = this._map.keys();
        let element = thisIterator.next();
        while (!element.done) {
            unionSet.add(element.value as unknown as T | U);
            element = thisIterator.next();
        }

        const otherIterator = other.keys();
        let otherElement = otherIterator.next();
        while (!element.done) {
            unionSet.add(otherElement.value as unknown as T | U);
            otherElement = otherIterator.next();
        }

        return unionSet;
    }
}


class Timer {
    public id: globalThis.Timer;
    private _whenWillExecute: number;

    public constructor(callback: (...args: unknown[]) => void, delay: number) {
        this._whenWillExecute = Date.now() + delay;
        this.id = setTimeout(callback, delay);
    }

    public get timeLeft(): number {
        return this._whenWillExecute - Date.now();
    }

    public clearTimer(): void {
        clearTimeout(this.id);
        this._whenWillExecute = -1;
    }
}
