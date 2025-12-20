## Functional Reactivity UI Toolkit (FRUIT)

FRUIT is a lightweight, zero-dependency UI framework written in JS for JS apps. It uses nested JavaScript objects to represent DOM elements, i.e.,

```javascript
import { appendChild } from "@fruit-ui/core";

const Paragraph = {
    tag: 'p',
    children: [
        'Writing in ',
        {tag: 'strong', style: {color: 'blue'}, children: 'FRUIT'},
        ' is fun!'
    ]
};

// to append an element to the DOM
appendChild(document.body, Paragraph);
```

FRUIT is powerful, efficient, and feature-packed. In addition to objects representing static elements, users can write stateful, reactive components, i.e.,

```javascript
import { appendChild } from "@fruit-ui/core";

const Counter = {
    state() {
        return {i: 0};
    },
    render() {
        return {
            tag: 'button',
            children: `I've been clicked ${this.state.i} times!`,
            on: {
                click() {
                    this.setState.i(this.state.i + 1);
                }
            }
        }
    }
}

appendChild(document.body, Counter);
```

FRUIT's features include:
- Intuitive element and component syntax
- Implicit props-passing between components
- Preserved, optionally reactive state
- Smooth, efficient rerendering with support for transitions and animations
- Keys to preserve state among re-ordered siblings
- An on-mount listener and handler methods
- Bindings to elements within components
- "Memo" options to make child components rerender conditionally

with all special functional features (state, controlled rerendering, bindings) accessed through the `this` argument.

Documentation is available for FRUIT [here](https://asantagata.github.io/fruit-ui/).

## Why FRUIT over other front-end frameworks?

Smaller apps don't always warrant heavyweight frameworks, but interfacing with the DOM directly is a hassle. The ability to declare and mutate state reactively is crucial in web apps with any amount of interactivity. Working in FRUIT and vanilla JS means no complex hidden logic to keep track of, no build step, and no separation of languages for your UI and your internal logic.

## Getting started

There are three ways to use FRUIT in your projects:
- Download and copy the [Terser-compressed JS file](https://github.com/asantagata/fruit-ui/blob/main/dist/index.js) file into your project. (This is a compressed version built with Terser; you can just as well use the [non-compressed version](https://github.com/asantagata/fruit-ui/blob/main/src/index.js) which uses JSDoc annotations.) Then you can use `import \* as fruit from "./modules/fruit.js"` or `<script type="module" src="./modules/fruit.js">` to access FRUIT in your JS apps.
- Access via browser loading, i.e., `import \* as fruit from "https://cdn.jsdelivr.net/npm/@fruit-ui/core@latest/src/index.js"`.
- With NPM installed, run `npm install @fruit-ui/core`. Then use `import \* as fruit from "@fruit-ui/core"`.

## Contributing

Ongoing development on FRUIT focuses on:
- Thorough, interactive, user-facing documentation (available [here](https://asantagata.github.io/fruit-ui/))
- Benchmarks against other JS frameworks
- Basic built-in components

This project's initial release is currently not yet finished, so contributions aren't currently being sought out.
