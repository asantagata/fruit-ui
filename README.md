## Functional Reactivity UI Toolkit (FRUIT)

FRUIT is a lightweight, zero-dependency UI framework written in JS for JS apps. It uses nested JavaScript objects to represent DOM elements, i.e.,

```javascript
import { appendChild } from "fruitui";

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
import { appendChild } from "fruitui";

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
                    this.setState.i(i + 1);
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

with all special functional features (state, controlled rerendering, bindings) accessed through the `this` argument.

## Why FRUIT over React, Svelte etc.?

Smaller apps don't always warrant large, complex frameworks, but directly interfacing with the DOM directly is a hassle. The ability to declare and mutate state reactively is crucial in web apps with any amount of interactivity. Working in FRUIT and vanilla JS means no complex hidden logic to keep track of, no build step, and no separation of languages for your UI and your internal logic.

## Getting started

There are three ways to use FRUIT in your projects:
- Download and copy the [Terser-compressed JS file](/dist/fruit.js) file into your project. (This is a compressed version built with Terser; you can just as well use the [non-compressed version](/src/index.js).) Then you can use `import { create, replaceWith, appendChild, insertBefore } from "./modules/fruit.js"` or `<script type="module" src="./modules/fruit.js">` to access FRUIT in your JS apps.
- Access via browser loading, i.e., `import { create, replaceWith, appendChild, insertBefore } from "https://cdn.jsdelivr.net/gh/asantagata/fruit-ui/dist/fruit.js"`.
- With NPM installed, run `npm install fruit-ui`. Then use `import { create, replaceWith, appendChild, insertBefore } from "fruit-ui"`. (As of writing, an NPM package has not yet been set up. So, this will not yet work!)

## Contributing

Ongoing development on FRUIT focuses on:
- Thorough, interactive, user-facing documentation
- Basic built-in components
This project's initial release is currently not yet finished, so contributions aren't currently being sought out.
