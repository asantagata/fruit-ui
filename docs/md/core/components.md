# Components

Components are a special kind of object which have some unique abilities not otherwise available to HTML elements. Namely, components are:
- *stateful*, meaning they have their own uniquely associated, private state;
- *rerenderable*, meaning they can have their display and content updated to reflect changes in state;
- and *reactive*, meaning they can rerender in response to state changes and other events.
The canonical example of a component is the `Counter`, seen here:

```{counter}
{
    state: { i: 0 }, // initialize state
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
```

By calling `this.setState.i()` in the click listener, it is possible to dynamically alter the component's content without engaging in direct DOM manipulation (i.e., by changing the text node's `textContent` or the button's `innerHTML`.)

## Rerendering

*Rerendering* is the act of updating a component's display and content to reflect changes in state. Assorted notes on rerendering:

- Except in the case of `memo`s (see #[below](#the-memo-and-memo-properties)), FRUIT rerenders entire subtrees. This means that a component might be rerendered because its own `setState()` or `rerender()` method was called, or it might be rerendered because an ancestor was rerendered and the effect is propagating downward through its children.
- When a component is rerendered as a result of an ancestor rerendering, its `render()` function is re-evaluated with new props taken into account. This means that props in `render()` do not get "stale."
- FRUIT rerenders are generally "smooth." This means that instead of deleting and re-creating a component, FRUIT individually updates the component's attributes and those of its descendants. This has several benefits. For instance, it permits CSS transitions to occur reactively and preserves focus.
- The `tagName` property on elements is read-only. If you attempt to change `tag`, the element will be deleted and re-created, meaning you do not get the aforementioned benefits.
- Listeners (i.e., the `on` property) are *not* updated across rerenders. This means you must handle any state-dependent logic within the listener, i.e., prefer `{on: {click() { this.state.x ? y() : z()}}}` to `{on: {click: this.state.x ? y : z}}`.
- To this end, you should also put any state references *inside* listeners. That is, avoid this pattern:
```
render() {
    const ref = this.state.myStateVariable;
    return {
        on: {
            click() { 
                operateOn(ref);
            }
        }
    };
}
```

At some other point, if `myStateVariable` is updated, `ref` may still hold the old value, meaning the listener `click()` may not operate as desired. Prefer this pattern:
```
render() {
    return {
        on: {
            click() { 
                const ref = this.state.myStateVariable;
                operateOn(ref);
            }
        }
    };
}
```

## State

A component's *state* is an object unique to that component which can contain any values you like. The `Counter` example #[above](#) utilizes one *state variable*, called `i`, but components can have any number of state variables. State variables are preserved across rerenders. State variables can be accessed and non-reactively modified through `this.state`, and can be reactively modified through `this.setState`. See @[Superpowered "this"](core-this) to learn more.

## Syntax

Here is a TypeScript-based signature for FRUIT components:

```
type Component = {
    render: () => Template,
    state?: Record<string, any> | () => Record<string, any>,
    key?: string,
    binding?: string,
    memo?: () => any,
    customMemo?: () => boolean
}
```

The following is a more thorough guide to components.

### The `render()` property

`render()` is the only mandatory property for a component. `render()` is a function returns a template (see @[Templates](core-templates)). This is significant: `render()` cannot return another component (i.e. `render() { return { render() { ... } } }`) and cannot return a `string`.

`render()` is the "recipe" for the component; it instructs FRUIT on how to display the component, not just initially, but every time it needs to be rerendered, such as on a `this.setState` call. `render()` is re-evaluated when the component is rerendered, so you can use mechanisms like the [conditional operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator), [.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), and even [IIFEs](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) to achieve functional, state-dependent results.

### The `state` or `state()` property

`state` and `state()` define the initial state of the component. `state` defines the component's state directly as an object while `state()` is a function whose return value is treated as the initial state.

`state()` is called only once in the "life cycle" of the component: at the very beginning before `render()`. While not necessary in every case, it is useful for `state()` to be initialized through a function rather than a static object definition because it allows state variables to be derived from one another. When not needed, you can instead declare `state` directly.

```{component-state}
{
    children: [
        {
            // object literal syntax for state
            state: { rand: Math.random() },
            render() {
                return { tag: 'p', children: this.state.rand };
            }
        },
        {
            // functional syntax for state
            state() {
                let rand = Math.random();
                let half = rand / 2;
                return {rand, half};
            },
            render() {
                return {
                    tag: 'p', 
                    children: `${this.state.rand}, ${this.state.half}`
                };
            }
        }
    ]
}
```

You can also perform other tasks in `state()` which you want to occur only once. Note, however, that most `this` properties (such as `this.element` and `this.rerender`) will not yet be accessible because `state()` is processed before other properties of components. If you want to wait until the component is fully initialized, use an @[on-mount function](core-templates#on) instead.

`state()` can be used in patterns like @[global context](core-patterns#global-context).

### The `memo()` and `customMemo()` properties

Components can be given a memo by assigning their `memo()` or `customMemo()` property. `memo()` must be a `() => object` and `customMemo()` must be a `() => boolean`. To learn more, see @[memo](core-memo).

### The `key` property

Components can be given a key by assigning their `key` property. This must be a `string`. The key is passed to the top-level element of the component. To learn more, see @[keys](core-keys).

### The `binding` property

Components can be given a binding by assigning their `binding` property. This must be a `string`. The binding is passed to the top-level element of the component. To learn more, see @[bindings](core-bindings).

## Component producers

Similar to @[template producers](core-templates#template-producers--props), component producers are functions which produce components. These might take in props from other components or pieces of business logic. The `render()` function is always re-evaluated with the newest props taken into account, so you do not have to worry about stale values for props. Using component producers is an effective pattern for managing large applications in FRUIT, as you can utilize both the reactivity of components and the intricacies of small, modular parts.

See the `Record()` component producer in the `memo` example #[above](the-memo-and-memo-properties). 

## Putting components on the DOM

You can use any of several FRUIT methods such as `appendChild` and `create` to put FRUIT components on the DOM. See @[Putting FRUIT on the DOM](core-putting-on-dom) to learn more.