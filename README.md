## Functional Reactivity UI Toolkit (FRUIT)

FRUIT is a lightweight, zero-dependency UI framework written in JS for JS apps. It uses nested JavaScript objects to represent DOM elements, i.e.,

```javascript
import { appendChild } from "fruitui";

const Paragraph = {
    tag: 'p',
    children: [
        'Writing in ',
        {tag: 'em', style: {color: 'blue'}, children: 'FRUIT'},
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

Ongoing development at FRUIT focuses on:
- Thorough, interactive, user-facing documentation
- Basic built-in components

## Why FRUIT over React, Svelte etc.?

Smaller apps don't always warrant large, complex frameworks, but directly interfacing with the DOM directly is a hassle. The ability to declare and mutate state reactively is crucial in web apps with any amount of interactivity. Working in FRUIT and vanilla JS means no complex hidden logic to keep track of, no build step, and no separation of languages for your UI and your internal logic.

## Getting started

TODO. As it stands, you can clone this repo and use `npx serve .` to view the contents of the "test" directory.

The options will be: standard NPM installation and importable or cloneable [terser](https://terser.org) builds.

## Contributing

This project's initial release is currently not yet finished, so contributions aren't currently being sought out.
