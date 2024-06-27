import { describe, it, expect, beforeEach } from "bun:test";
import { OrderedMap } from "./OrderedMap";
import { Ordering } from "./shared";

describe("OrderedMap", () => {
    describe("constructor", () => {
        it("should create an empty map when no arguments are provided", () => {
            const map = new OrderedMap<number, string>();
            expect(map.size).toBe(0);
        });

        it("should initialize with provided entries", () => {
            const entries: Array<[number, string]> = [
                [1, "one"],
                [2, "two"],
                [3, "three"],
            ];
            const map = new OrderedMap(entries);
            expect(map.size).toBe(3);
            expect(map.get(1)).toBe("one");
            expect(map.get(2)).toBe("two");
            expect(map.get(3)).toBe("three");
        });

        it("should use custom equality function when provided", () => {
            const customEq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
            const map = new OrderedMap<string, number>(undefined, customEq);
            map.set("A", 1);
            expect(map.get("a")).toBe(1);
        });

        it("should use custom comparator function when provided", () => {
            const customCmp = (a: number, b: number) => b - a; // Reverse order
            const map = new OrderedMap<number, string>(undefined, undefined, customCmp);
            map.set(1, "one");
            map.set(3, "three");
            map.set(2, "two");
            expect(Array.from(map.keys())).toEqual([3, 2, 1]);
        });
    });

    describe("set and get", () => {
        let map: OrderedMap<number, string>;

        beforeEach(() => {
            map = new OrderedMap<number, string>();
        });

        it("should set and get values correctly", () => {
            map.set(1, "one");
            expect(map.get(1)).toBe("one");
        });

        it("should overwrite existing values", () => {
            map.set(1, "one");
            map.set(1, "uno");
            expect(map.get(1)).toBe("uno");
        });

        it("should return undefined for non-existent keys", () => {
            expect(map.get(999)).toBeUndefined();
        });
    });

    describe("has and delete", () => {
        let map: OrderedMap<number, string>;

        beforeEach(() => {
            map = new OrderedMap<number, string>();
            map.set(1, "one");
            map.set(2, "two");
        });

        it("should correctly check if a key exists", () => {
            expect(map.has(1)).toBe(true);
            expect(map.has(3)).toBe(false);
        });

        it("should delete existing keys", () => {
            expect(map.delete(1)).toBe(true);
            expect(map.has(1)).toBe(false);
            expect(map.size).toBe(1);
        });

        it("should return false when deleting non-existent keys", () => {
            expect(map.delete(3)).toBe(false);
            expect(map.size).toBe(2);
        });
    });

    describe("clear", () => {
        it("should remove all entries from the map", () => {
            const map = new OrderedMap<number, string>([
                [1, "one"],
                [2, "two"],
            ]);
            map.clear();
            expect(map.size).toBe(0);
            expect(map.has(1)).toBe(false);
        });
    });

    describe("sorting and iteration", () => {
        let map: OrderedMap<number, string>;

        beforeEach(() => {
            map = new OrderedMap<number, string>();
            map.set(3, "three");
            map.set(1, "one");
            map.set(2, "two");
        });

        it("should iterate keys in sorted order", () => {
            expect(Array.from(map.keys())).toEqual([1, 2, 3]);
        });

        it("should iterate values in sorted order", () => {
            expect(Array.from(map.values())).toEqual(["one", "two", "three"]);
        });

        it("should iterate entries in sorted order", () => {
            expect(Array.from(map.entries())).toEqual([
                [1, "one"],
                [2, "two"],
                [3, "three"],
            ]);
        });

        it("should use forEach in sorted order", () => {
            const result: Array<[number, string]> = [];
            map.forEach((value, key) => result.push([key, value]));
            expect(result).toEqual([
                [1, "one"],
                [2, "two"],
                [3, "three"],
            ]);
        });

        it("should be iterable in sorted order", () => {
            expect(Array.from(map)).toEqual([
                [1, "one"],
                [2, "two"],
                [3, "three"],
            ]);
        });
    });

    describe("custom equality and comparison", () => {
        it("should use custom equality function", () => {
            const map = new OrderedMap<string, number>(
                undefined,
                (a, b) => a.toLowerCase() === b.toLowerCase(),
            );
            map.set("A", 1);
            expect(map.has("a")).toBe(true);
            expect(map.get("a")).toBe(1);
        });

        it("should use custom comparison function", () => {
            const map = new OrderedMap<number, string>(
                undefined,
                undefined,
                (a, b) => b - a, // Reverse order
            );
            map.set(1, "one");
            map.set(3, "three");
            map.set(2, "two");
            expect(Array.from(map.keys())).toEqual([3, 2, 1]);
        });
    });

    describe("invalidation", () => {
        it("should invalidate sorted entries on set", () => {
            const map = new OrderedMap<number, string>([
                [1, "one"],
                [3, "three"],
            ]);
            expect(map["_sortedEntries"]).toBeUndefined();
            Array.from(map.entries()); // Force sorting
            expect(map["_sortedEntries"]).toBeDefined();
            map.set(2, "two");
            expect(map["_sortedEntries"]).toBeUndefined();
        });

        it("should invalidate sorted entries on delete", () => {
            const map = new OrderedMap<number, string>([
                [1, "one"],
                [2, "two"],
                [3, "three"],
            ]);
            Array.from(map.entries()); // Force sorting
            expect(map["_sortedEntries"]).toBeDefined();
            map.delete(2);
            expect(map["_sortedEntries"]).toBeUndefined();
        });

        it("should invalidate sorted entries on clear", () => {
            const map = new OrderedMap<number, string>([
                [1, "one"],
                [2, "two"],
            ]);
            Array.from(map.entries()); // Force sorting
            expect(map["_sortedEntries"]).toBeDefined();
            map.clear();
            expect(map["_sortedEntries"]).toBeUndefined();
        });
    });

    describe("edge cases", () => {
        it("should handle objects with custom comparison methods", () => {
            class ComparableObject {
                constructor(public value: number) {}
                eq(other: ComparableObject): boolean {
                    return this.value === other.value;
                }
                cmp(other: ComparableObject): Ordering {
                    return this.value < other.value
                        ? Ordering.Less
                        : this.value > other.value
                        ? Ordering.Greater
                        : Ordering.Equal;
                }
            }

            const map = new OrderedMap<ComparableObject, string>();
            const obj1 = new ComparableObject(1);
            const obj2 = new ComparableObject(2);
            const obj3 = new ComparableObject(3);

            map.set(obj2, "two");
            map.set(obj1, "one");
            map.set(obj3, "three");

            expect(Array.from(map.keys()).map((obj) => obj.value)).toEqual([1, 2, 3]);
        });

        it("should handle setting the same key multiple times", () => {
            const map = new OrderedMap<number, string>();
            map.set(1, "one");
            map.set(1, "uno");
            map.set(1, "ein");
            expect(map.size).toBe(1);
            expect(map.get(1)).toBe("ein");
        });

        it("should maintain order when using non-primitive keys", () => {
            const map = new OrderedMap<{ id: number }, string>(
                undefined,
                (a, b) => a.id === b.id,
                (a, b) => a.id - b.id,
            );
            map.set({ id: 3 }, "three");
            map.set({ id: 1 }, "one");
            map.set({ id: 2 }, "two");
            expect(Array.from(map.keys()).map((k) => k.id)).toEqual([1, 2, 3]);
        });
    });
});
