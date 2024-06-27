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
