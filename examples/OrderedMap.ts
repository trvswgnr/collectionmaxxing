import { OrderedMap } from "../src/OrderedMap";
import type { Eq, Cmp } from "../src/shared";

// example
class Person implements Eq<Person>, Cmp<Person> {
    constructor(public id: number, public name: string) {}

    eq(other: Person) {
        return this.id === other.id;
    }

    cmp(other: Person) {
        return this.name.localeCompare(other.name);
    }
}

const team = new OrderedMap<Person, string>();

team.set(new Person(1, "Dennis"), "The Looks");
team.set(new Person(2, "Mac"), "The Brains");
team.set(new Person(3, "Charlie"), "The Wildcard");
team.set(new Person(4, "Frank"), "The Muscle");
team.set(new Person(5, "Dee"), "Bird");

const mac = team.get(new Person(2, "Mac"));
console.log(mac);
console.assert(Object.is(mac, "The Brains"));

const hasCharlie = team.has(new Person(3, "Charlie"));
console.log(hasCharlie);
console.assert(Object.is(hasCharlie, true));

const theGang = Array.from(team.entries())
    .map(([k]) => k.name)
    .join(", ");
console.log(theGang);
console.assert(Object.is(theGang, "Charlie, Dee, Dennis, Frank, Mac"));
