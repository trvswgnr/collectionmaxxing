import { defaultEqualityFn, defaultComparatorFn } from "./shared";

export class OrderedMap<K, V> extends Map<K, V> {
    private equalityFn: (a: K, b: K) => boolean;
    private comparatorFn: (a: K, b: K) => number;
    private _sortedEntries?: Array<[K, V]>;

    constructor(
        entries?: Iterable<[K, V]>,
        equalityFn?: (a: K, b: K) => boolean,
        comparatorFn?: (a: K, b: K) => number,
    ) {
        super();
        this.equalityFn = equalityFn ?? defaultEqualityFn;
        this.comparatorFn = comparatorFn ?? defaultComparatorFn;
        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }

    private findKey(key: K): K | undefined {
        for (const existingKey of super.keys()) {
            if (this.equalityFn(existingKey, key)) {
                return existingKey;
            }
        }
        return undefined;
    }

    set(key: K, value: V): this {
        this.invalidate();
        return super.set(this.findKey(key) ?? key, value);
    }

    get(key: K): V | undefined {
        const existing = this.findKey(key);
        return existing !== undefined ? super.get(existing) : undefined;
    }

    has(key: K): boolean {
        return this.findKey(key) !== undefined;
    }

    delete(key: K): boolean {
        const existingKey = this.findKey(key);
        if (existingKey !== undefined) {
            this.invalidate();
            return super.delete(existingKey);
        }
        return false;
    }

    invalidate() {
        this._sortedEntries = undefined;
    }

    get sortedEntries() {
        if (this._sortedEntries === undefined) {
            this._sortedEntries = Array.from(super.entries());
            this._sortedEntries.sort(([a], [b]) => this.comparatorFn(a, b));
        }
        return this._sortedEntries;
    }

    clear(): void {
        this.invalidate();
        super.clear();
    }

    *keys(): IterableIterator<K> {
        for (const [k] of this.sortedEntries) {
            yield k;
        }
    }

    *values(): IterableIterator<V> {
        for (const [_, v] of this.sortedEntries) {
            yield v;
        }
    }

    *entries(): IterableIterator<[K, V]> {
        for (const entry of this.sortedEntries) {
            yield entry;
        }
    }

    forEach(fn: (value: V, key: K, map: this) => void): void {
        for (const [k, v] of this.sortedEntries) {
            fn(v, k, this);
        }
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }
}
