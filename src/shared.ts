export enum Ordering {
    Less = -1,
    Equal = 0,
    Greater = 1,
}

export interface Eq<T> {
    eq(other: T): boolean;
}

export function implementsEq<T>(x: T | Eq<T>): x is Eq<T> {
    return (
        typeof x === "object" &&
        x !== null &&
        "eq" in x &&
        typeof x.eq === "function" &&
        x.eq.length === 1
    );
}

export interface Cmp<T> {
    cmp(other: T): Ordering;
}

export function implementsCmp<T>(x: T | Cmp<T>): x is Cmp<T> {
    return (
        typeof x === "object" &&
        x !== null &&
        "cmp" in x &&
        typeof x.cmp === "function" &&
        x.cmp.length === 1
    );
}

export function defaultEqualityFn<K>(a: K, b: K): boolean {
    if (implementsEq(a)) {
        return a.eq(b);
    }
    return a === b;
}

export function defaultComparatorFn<K>(a: K, b: K): Ordering {
    if (implementsCmp(a)) {
        return a.cmp(b);
    }
    if (a < b) return Ordering.Less;
    if (a > b) return Ordering.Greater;
    return Ordering.Equal;
}

export interface ReadonlySetLike<T> {
    [Symbol.iterator](): Iterator<T>;
    size: number;
    entries(): IterableIterator<[T, T]>;
    forEach(fn: (value: T) => void): void;
    has(value: T): boolean;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
}

export interface SetLike<T> extends ReadonlySetLike<T> {
    add(value: T): this;
    delete(value: T): boolean;
    clear(): void;
}

export class Collection<T> extends Set<T> {
    constructor(iterable?: Iterable<T>) {
        super(iterable);
    }
    toArray(): Array<T> {
        return Array.from(this);
    }
    hasAll(coll: ReadonlySetLike<T>): boolean {
        let result = true;
        for (const value of coll) {
            if (!this.has(value)) {
                result = false;
                break;
            }
        }
        return result;
    }
    removeAll(coll: Iterable<T>): number {
        let result = 0;
        for (const value of coll) {
            if (this.delete(value)) {
                result++;
            }
        }
        return result;
    }
    retainAll(coll: ReadonlySetLike<T>): number {
        let result = 0;
        for (const value of this) {
            if (!coll.has(value)) {
                this.delete(value);
                result++;
            }
        }
        return result;
    }
    isEmpty(): boolean {
        return this.size === 0;
    }
    addAll(coll: Iterable<T>): this {
        for (const value of coll) {
            this.add(value);
        }
        return this;
    }
    removeIf(predicate: (value: T) => boolean): number {
        let result = 0;
        for (const value of this) {
            if (predicate(value)) {
                this.delete(value);
                result++;
            }
        }
        return result;
    }
}
