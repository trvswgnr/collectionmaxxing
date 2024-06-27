import { OrderedSet } from "../src/OrderedSet";
import type { Cmp, Eq } from "../src/shared";

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

// Example usage
const team = new OrderedSet<Person>();

team.add(new Person(1, "Dennis"));
team.add(new Person(2, "Mac"));
team.add(new Person(3, "Charlie"));
team.add(new Person(4, "Frank"));
team.add(new Person(5, "Dee"));

console.log(team.has(new Person(2, "Mac"))); // true
console.log(Array.from(team)); // Sorted by name: Charlie, Dee, Dennis, Frank, Mac
