# Superpowered `this`

Inside FRUIT components and listeners, the `this` keyword does not refer to the global context or the current object. When processing your templates and components, functions like `render()` and `{on: {click()}}` are [bound](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) to a context that lets them access features like `this.rerender`, `this.state`, and `this.bindings` — and give you superpowers.

## Syntax

In JavaScript, the `this` keyword is a property accessible in functions, usually used as a reference to the instance of a [class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). In FRUIT, we use standard functions. However, we have to be cautious about our syntax to ensure that `this` is distributed properly.

### `() => {}` vs `function()`

JavaScript has two significant kinds of functions; we'll call these *non-contextual* and *contextual.*

Non-contextual functions are declared with an arrow (`=>`). They might or might not use curly braces; if they do not, they must consist of only one statement whose value is returned. These functions *cannot* have their own `this`. Instead, they must absorb the `this` of their calling context. Sometimes, this is very useful; when using `.map` or `.filter`, for instance, we'll often want to use the same `this` inside the callback as outside. That is:

```
render() {
    return {
        children: this.state.users.map(user => ({
            children: [
                {tag: 'b', children: user.name},
                ': ',

                // since we used an arrow function above,
                // we can reference this.state inside

                this.state.boats
                    .find(boat => boat.ownerId === user.id).location
            ]
        }))
    };
}
```

Scoped functions, on the other hand, *always* have their own `this`. There are a few ways to declare these:
- the standard `function` keyword, as in `function MyFunction() { ... }`;
- the anonymous `function` keyword, as in `const MyFunction = function() { ... }`;
- and the object method definition, as in `const MyObject { MyFunction() { ... } }`.
For most use cases (`render()`, `memo()`, listeners in `on`), we use the third syntax, which allows FRUIT to bind these as needed. (At present, all event callbacks have names that are valid JavaScript identifiers, meaning they can be used as function names in `on`; if this ever changes (or in the case of [custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) with invalid names), the syntax `{on: {'hyphenated-event': function(e) { ... }}}` can be used synonymously.)

### Passing `this`

The `this` keyword can be passed to other functions as needed, though most of the time, it may be cleaner to pass only the part you need. If you must pass the whole object, it is preferred to pass it as a standard argument rather than as a `this` (i.e., by using [call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)) That is, prefer `MyFunction(this)` to `MyFunction.call(this)`.

## Properties of `this`

The following list describes all properties of the `this` keyword. With the exception of `this.target`, they are only available within components.

### `this.producer` and `this.memo`

These are two properties you should not touch. `this.producer` is the saved, bounded instance of the `render()` function, used for rerendering; `this.memo` is the saved clone of the memo against which new memos are compared.

### `this.element`

This is a maintained reference to the top-level `HTMLElement` of the component. You can use it to do your own DOM manipulation on that element. To do DOM manipulation on other elements, see @[Bindings](core-bindings).

### `this.rerender()`

This function starts an immediate rerender on the component, starting from `this.element`. Rerenders are discussed in @[Components](core-components) If you are using `this.rerender()` in a listener, it is advisable for it to be the last operation in the listener.

### `this.state`

This is an object whose properties are the component's state values. You can access and non-reactively mutate any state values by reading and writing, say, `this.state.myStateVariable`.

### `this.setState`

This is an object with the same keys as `this.state`. However, its properties are special setter functions. By calling `this.setState.myStateVariable(2)`, you immediately set `this.state.myStateVariable` to `2` and enqueue a rerender as a [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide). The queue is based on a set of unique component IDs, meaning that calling `this.setState` functions multiple times in one listener will not cause multiple rerenders. Notably, this queue does *not* perform any checks or depth-sorting on the components before rerendering; if, for instance, a bubbling event causes both a parent component and a child component to enqueue rerenders through `this.setState`, then the child may be rerendered twice (once as its own event, then once again as the propagated call from the parent).

### `this.bindings`

This is an object whose properties are the `{element: HTMLElement, rerender: Function}` object corresponding to each of the component's @[bindings](core-bindings).

### `this.target`

This is the only `this` property not unique to components, and the only one which can only be used in `on` event callbacks. It references the `HTMLElement` receiving the event the listener is for. That is:

```
render() {
    return {
        class: 'parent',
        children: {
            class: 'child',
            on: { 
                click() {
                    // this.element is the top-level element,
                    // in this case .parent
                    console.log(this.element);

                    // this.target is the calling element,
                    // in this case .child
                    console.log(this.child);
                } 
            }
        }
    };
}
```

Using `this` to update state, create reactivity, and make the most of your components is the core benefit of using FRUIT.