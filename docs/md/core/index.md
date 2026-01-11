# The *Functional-Reactivity UI Toolkit* (FRUIT)

## What is FRUIT?

FRUIT is a lightweight, zero-dependency UI framework written in JavaScript for JavaScript apps. It uses nested objects to represent DOM elements, i.e.,

```{fun}
import { appendChild } from '@fruit-ui/core';

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

```{counter}
import { appendChild } from '@fruit-ui/core';

const Counter = {
    state: { i: 0 },
    render() {
        return {
            tag: 'button',
            children: `I've been clicked ${this.state.i} time${this.state.i === 1 ? '' : 's'}!`,
            on: {
                click() {
                    this.setState.i(this.state.i + 1);
                }
            }
        };
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
- Memoized handling for tactically skipping rerenders

with all special functional features (state, controlled rerendering, bindings) accessed through the `this` argument.

## Why use FRUIT over other front-end frameworks?

Smaller apps don't always warrant large, complex frameworks, but interfacing with the DOM directly is a hassle. The ability to declare and mutate state reactively is crucial in web apps with any amount of interactivity. Working in FRUIT and vanilla JS means no complex hidden logic to keep track of, no build step, and no separation of languages for your UI and your internal logic.

FRUIT's uniform object and function-based structure allows you to apply all the flexibility of JavaScript objects to your front-end, avoiding casting DOM types or working with HTML strings while still working in a pure JavaScript environment. Instead, you work on your DOM elements the same way you work on your other data. In fact, the only exports from the `[[pink]]@fruit-ui/core` package are utilities for attaching FRUIT elements to the DOM, which means that until you're appending them to `document.body`, your components are just regular JavaScript objects and functions. 

This makes FRUIT an ideal environment for web applications with complex DOM-related logic.
