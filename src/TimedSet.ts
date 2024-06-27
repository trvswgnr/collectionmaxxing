import type { ReadonlySetLike, SetLike, SetUtils } from "./shared";

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

    /**
     * Get the underlying set
     */
    uniqueSet(): Set<T>;
}

/**
 * This set will evict items from the array after the set timeout.
 * This set can only contain unique items, items are unique when === is true
 */
export class TimedSet<T> implements ITimedSet<T>, SetLike<T>, SetUtils<T> {
    public [Symbol.toStringTag] = "TimedSet";
    private map: Map<T, Timer>;

    /**
     * @param timeout - Timeout in milliseconds
     */
    constructor(private timeout: number) {
        if (Number.isNaN(timeout)) {
            throw new Error("Timeout must be a valid number");
        }
        this.map = new Map();
    }

    public get size(): number {
        return this.map.size;
    }

    public refresh(key: T): boolean {
        const timeoutFunction = this.map.get(key);
        if (!timeoutFunction) {
            return false;
        }
        timeoutFunction.clearTimer();
        this.add(key);
        return true;
    }

    public uniqueSet(): Set<T> {
        return new Set(this.map.keys());
    }

    public isEmpty(): boolean {
        return this.map.size === 0;
    }

    public add(key: T, timeoutOverload?: number): this {
        const timer = new Timer(() => this.delete(key), timeoutOverload ?? this.timeout);
        this.map.set(key, timer);
        return this;
    }

    public has(value: T): boolean {
        return this.map.has(value);
    }

    public delete(key: T): boolean {
        const timeoutFunction = this.map.get(key);
        if (!timeoutFunction) {
            return false;
        }
        timeoutFunction.clearTimer();
        return this.map.delete(key);
    }

    public clear(): void {
        for (const [_, value] of this.map) {
            value.clearTimer();
        }
        this.map.clear();
    }

    public [Symbol.iterator](): IterableIterator<T> {
        return this.map.keys();
    }

    public *entries(): IterableIterator<[T, T]> {
        for (const key of this.map.keys()) {
            yield [key, key];
        }
    }

    public forEach(
        callbackfn: (value: T, value2: T, set: Set<T>) => void,
        thisArg?: unknown,
    ): void {
        for (const key of this.map.keys()) {
            callbackfn.call(thisArg, key, key, this.uniqueSet());
        }
    }

    public keys(): IterableIterator<T> {
        return this.map.keys();
    }

    public values(): IterableIterator<T> {
        return this.map.keys();
    }

    public getTimeRemaining(key: T): number {
        const item = this.map.get(key);
        if (!item) {
            return -1;
        }
        return item.timeLeft;
    }

    // -- advanced set operations -- //

    public difference<U>(other: ReadonlySetLike<U>): Set<T> {
        const result = this.uniqueSet() as Set<any>;
        for (const value of other.keys()) {
            result.delete(value);
        }
        return result;
    }

    public intersection(other: ReadonlySetLike<T>): Set<T> {
        const self: ReadonlySetLike<T> = this.uniqueSet();
        const intersection = new Set<T>();

        // iterate over the smaller set, for speed
        let smallerSet = self;
        let largerSet = other;
        if (self.size > other.size) {
            smallerSet = other;
            largerSet = self;
        }

        for (const item of smallerSet) {
            if (largerSet.has(item)) {
                intersection.add(item);
            }
        }

        return intersection;
    }

    public isDisjointFrom(other: ReadonlySetLike<T>): boolean {
        for (const value of other.keys()) {
            if (this.map.has(value)) {
                return false;
            }
        }
        return true;
    }

    public isSubsetOf(other: ReadonlySetLike<T>): boolean {
        for (const elem of this.map.keys()) {
            if (!other.has(elem)) {
                return false;
            }
        }
        return true;
    }

    public isSupersetOf(other: ReadonlySetLike<T>): boolean {
        for (const value of other.keys()) {
            if (!this.map.has(value)) {
                return false;
            }
        }
        return true;
    }

    public symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
        const result = new Set<T | U>();

        for (const value of this.map.keys()) {
            result.add(value);
        }

        for (const value of other.keys()) {
            if (result.has(value)) {
                result.delete(value);
                continue;
            }
            result.add(value);
        }

        return result;
    }

    public union<U>(other: ReadonlySetLike<U>): Set<T | U> {
        const unionSet = new Set<T | U>();

        for (const value of this.map.keys()) {
            unionSet.add(value);
        }

        for (const value of other.keys()) {
            unionSet.add(value);
        }

        return unionSet;
    }
}

type TimerId = ReturnType<typeof globalThis.setTimeout>;

class Timer {
    public timerId: TimerId;
    private expirationTimeMs: number;

    public constructor(callback: () => void, delayMs: number) {
        this.expirationTimeMs = Date.now() + delayMs;
        this.timerId = setTimeout(callback, delayMs);
    }

    public get timeLeft(): number {
        return this.expirationTimeMs - Date.now();
    }

    public clearTimer(): void {
        clearTimeout(this.timerId);
        this.expirationTimeMs = -1;
    }
}
