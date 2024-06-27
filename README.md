# CollectionMaxxing

A TypeScript/JavaScript library that provides solid implementations of various data structures and collections. The goal is to have performant, type-safe, and easy-to-use alternatives to standard JavaScript collections.

## Features

-   **OrderedMap**: A Map implementation that maintains insertion order and supports custom equality and comparison functions.
-   ... more to come ...

## Installation

```bash
npm install collectionmaxxing
```

## Usage

Here's a quick example of how to use the `OrderedMap`:

```typescript
import { OrderedMap } from "collectionmaxxing";

const map = new OrderedMap<number, string>();

map.set(3, "three");
map.set(1, "one");
map.set(2, "two");

console.log(Array.from(map.keys())); // [1, 2, 3]
console.log(Array.from(map.values())); // ["one", "two", "three"]
```

## Contributing

Contributions are welcome - [open an issue](https://github.com/trvswgnr/collectionmaxxing/issues) or [submit a PR](https://github.com/trvswgnr/collectionmaxxing/pulls).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

-   Implement more collection types (e.g., OrderedSet, PriorityQueue)
-   Make perf better.
-   Add more documentation and examples
