import type { Collection, Eq, ReadonlySetLike } from "./shared";

export interface Bag<T> extends Collection<T>, Eq<T> {
    /**
     * Adds one copy of the specified value to the Bag.
     * @param value the value to add
     * @returns true if the value was not already in the uniqueSet
     */
    add(value: T): this;
    /**
     * Adds nCopies copies of the specified value to the Bag.
     * @param value the value to add
     * @param nCopies the number of copies to add
     * @returns true if the value was not already in the uniqueSet
     */
    add(value: T, nCopies: number): this;

    /**
     * Returns true if the bag contains all values in the given collection, respecting cardinality.
     * @param coll the collection to check against
     * @returns true if the Bag contains all the collection
     */
    containsAll(coll: Iterable<unknown>): boolean;

    /**
     * Returns the number of occurrences (cardinality) of the given value currently in the bag.
     * @param value the value to search for
     * @returns the number of occurrences of the value, zero if not found
     */
    getCount(value: T): number;

    /**
     * Removes all occurrences of the given value from the bag.
     * @param value the value to remove
     * @returns true if this call changed the collection
     */
    delete(value: unknown): boolean;
    /**
     * Removes nCopies copies of the specified value from the Bag.
     * @param value the value to remove
     * @param nCopies the number of copies to remove
     * @returns true if this call changed the collection
     */
    delete(value: unknown, nCopies: number): boolean;

    /**
     * Remove all values represented in the given collection, respecting cardinality.
     * @param coll the collection to remove
     * @returns true if this call changed the collection
     */
    removeAll(coll: Iterable<unknown>): number;

    /**
     * Remove any members of the bag that are not in the given collection, respecting cardinality.
     * @param coll the collection to retain
     * @returns true if this call changed the collection
     */
    retainAll(coll: ReadonlySetLike<unknown>): number;

    /**
     * Returns the total number of items in the bag across all types.
     * @returns the total size of the Bag
     */
    get size(): number;

    /**
     * Returns a Set of unique values in the Bag.
     * @returns the Set of unique Bag values
     */
    uniqueSet(): Set<T>;
}
