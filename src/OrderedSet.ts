import { defaultEqualityFn, defaultComparatorFn } from "./shared";

export class OrderedSet<T> extends Set<T> {
    private equalityFn: (a: T, b: T) => boolean;
    private comparatorFn: (a: T, b: T) => number;
    private _sortedValues?: Array<T>;

    constructor(
        iterable?: Iterable<T>,
        equalityFn?: (a: T, b: T) => boolean,
        comparatorFn?: (a: T, b: T) => number,
    ) {
        super();
        this.equalityFn = equalityFn ?? defaultEqualityFn;
        this.comparatorFn = comparatorFn ?? defaultComparatorFn;
        if (iterable) {
            for (const item of iterable) {
                this.add(item);
            }
        }
    }

    private findElement(element: T): T | undefined {
        for (const existingElement of super.values()) {
            if (this.equalityFn(existingElement, element)) {
                return existingElement;
            }
        }
        return undefined;
    }

    add(element: T): this {
        const existing = this.findElement(element);
        if (existing === undefined) {
            super.add(element);
            this.invalidate();
        }
        return this;
    }

    has(element: T): boolean {
        return this.findElement(element) !== undefined;
    }

    delete(element: T): boolean {
        const existingElement = this.findElement(element);
        if (existingElement !== undefined) {
            this.invalidate();
            return super.delete(existingElement);
        }
        return false;
    }

    invalidate() {
        this._sortedValues = undefined;
    }

    get sortedValues() {
        if (this._sortedValues === undefined) {
            this._sortedValues = Array.from(super.values());
            this._sortedValues.sort(this.comparatorFn);
        }
        return this._sortedValues;
    }

    clear(): void {
        this.invalidate();
        super.clear();
    }

    *values(): IterableIterator<T> {
        for (const element of this.sortedValues) {
            yield element;
        }
    }

    *keys(): IterableIterator<T> {
        for (const element of this.sortedValues) {
            yield element;
        }
    }

    *entries(): IterableIterator<[T, T]> {
        for (const element of this.sortedValues) {
            yield [element, element];
        }
    }

    forEach(fn: (value: T, value2: T, set: this) => void): void {
        for (const element of this.sortedValues) {
            fn(element, element, this);
        }
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.values();
    }
}
