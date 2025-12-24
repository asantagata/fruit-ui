# The *Functional-Reactivity UI Toolkit* (FRUIT)

## What is FRUIT?

FRUIT is a lightweight, zero-dependency UI framework written in JavaScript for JavaScript apps. It uses nested JavaScript objects to represent DOM elements, i.e.,

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
    state() {
        return {i: 0}; // initialize state
    },
    render() {
        return {
            tag: 'button',
            children: `I've been clicked ${this.state.i} time${this.state.i === 1 ? '' : 's'}!`,
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
- "Memo" handling for tactically skipping rerenders

with all special functional features (state, controlled rerendering, bindings) accessed through the `this` argument.

## Why use FRUIT over other front-end frameworks?

Smaller apps don't always warrant large, complex frameworks, but interfacing with the DOM directly is a hassle. The ability to declare and mutate state reactively is crucial in web apps with any amount of interactivity. Working in FRUIT and vanilla JS means no complex hidden logic to keep track of, no build step, and no separation of languages for your UI and your internal logic.