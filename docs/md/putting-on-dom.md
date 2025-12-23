# Putting FRUIT on the DOM

FRUIT templates and components are simple and powerful, but not worth much without a way to turn them into `HTMLElement`s and put them on the DOM. FRUIT provides several ways to do this; in fact, methods for doing this are the sole exports of the `[[pink]]@fruit-ui/core` package.

These methods are:

## `fruit.appendChild()`

`appendChild()` takes in two arguments: a `Node` and an "`Elementable`" (i.e., `Template | Component | string`). It converts the `Elementable` into an `HTMLElement` (or a text node), appends it to the `Node`'s children (see [appendChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)), and handles all on-mount functions.

## `fruit.replaceWith()`

`replaceWith()` takes in two arguments: a `Node` and an `Elementable`. It converts the `Elementable` into an `HTMLElement` (or a text node), replaces the `Node` with it (see [replaceWith](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceWith)), and handles all on-mount functions.

## `fruit.insertBefore()`

`insertBefore()` takes in three arguments: a `Node`, a `Node | null`, and an `Elementable`. If the second argument is a `Node`, it must be a child of the first `Node`. It converts the `Elementable` into an `HTMLElement` (or a text node), inserts it as a child of the first `Node` immediately before the second `Node` (or at the very end if `null`; see [insertBefore](https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore)), and handles all on-mount functions.

## `fruit.create()`

`create()` takes one or two arguments: an `Elementable` and an optional boolean argument, `includeOnMounts`. It converts the `Elementable` into an `HTMLElement` (or a text node) and returns it. You can then use DOM manipulation functions to insert or append it. 

`create()` does *not* handle on-mount functions. If `includeOnMounts` is true, then `create()` returns `{element: HTMLElement, onMounts: Function[]}`, where all onMounts functions are already bounded to their corresponding targets. You can work with `create().element` as usual, but must handle any `onMounts` on your own (or ignore them).

## `fruit.handleOnMounts()`

`handleOnMounts()` takes in a `Function[]` describing a list of on-mount functions, i.e., the secondary return value of `create()`. It is equivalent to `onMounts.forEach(om => om())`.

```{counter}
import { appendChild } from '@fruit-ui/core';

const Counter = {
    // ...
}

appendChild(document.body, Counter);
```

You can use any of these methods to put your FRUIT components and templates on the DOM.