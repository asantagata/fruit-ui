# Components

Components are a special kind of object which have some unique abilities not otherwise available to HTML elements. Namely, components are:
- *stateful*, meaning they have their own uniquely associated, private state;
- *rerenderable*, meaning they can have their display and content updated to reflect changes in state;
- and *reactive*, meaning they can rerender in response to state changes and other events.
The canonical example of a component is the `Counter`, seen here:

```{counter}
{
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
    };
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
    state?: () => Record<string, any>,
    key?: string,
    binding?: string,
    memo?: any | () => boolean
}
```

The following is a more thorough guide to components.

### The `render()` property

`render()` is the only mandatory property for a component. `render()` is a function returns a template (see @[Templates](core-templates)). This is significant: `render()` cannot return another component (i.e. `render() { return { render() { ... } } }`) and cannot return a `string`.

`render()` is the "recipe" for the component; it instructs FRUIT on how to display the component, not just initially, but every time it needs to be rerendered, such as on a `this.setState` call. `render()` is re-evaluated when the component is rerendered, so you can use mechanisms like the [conditional operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator), [.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), and even [IIFEs](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) to achieve functional, state-dependent results.

### The `state()` property

`state()` defines the initial state of the component. It is called only once in the "life cycle" of the component: at the very beginning before `render()`. While not necessary in every case, it is useful for `state()` to be initialized through a function rather than a static object definition because it allows state variables to be derived from one another.

### The `memo` and `memo()` properties

By default, FRUIT rerenders entire subtrees. That is to say: if component `Parent` has components `Child1` and `Child2` as children, then rerendering `Parent` will also cause `Child1`, `Child2`, and any grandchildren to rerender as well. Sometimes this is superfluous or unnecessary, but with no compile step, FRUIT does not have any inherent mechanism to know that. To this end, `memo` and `memo()` allow you to *tell* FRUIT that a component does not need to be rerendered.

`memo` can be any *non-function* value that can be deep-cloned, i.e., any non-circular combination of objects, iterables (arrays, sets, maps) and primitives. Functions may appear within `memo` but `memo` may not itself be a function (for this use case). When a component with `memo` is made to rerender as part of an ancestor's rerender, FRUIT will compare the old and new values of `memo` with a deep equality check. If the values are found to be the same, FRUIT will not rerender the component. 

One common use case for this is to compare the props (discussed in @[Templates](core-templates)) of a component producer. Here, the `Record` component updates only when its prop updates. Try editing the input to change the third user's name; only one user's "last rendered" timestamp will change.

```{memo}
function Record(user) {
    return {
        render() {
            return {
                children: [
                    {tag: 'p', children: `ID: ${user.id}`},
                    {tag: 'p', children: `Name: ${user.name}`},
                    {tag: 'p', children: `Last rendered: ${Date.now()}`},
                ]
            };
        },
        memo: user
    };
}

// ...

{
    state() {
        return { 
            users: [
                {id: 1, name: 'Alice'},
                {id: 2, name: 'Bob'},
                {id: 3, name: 'Parlie'}
            ]
        }
    },
    render() {
        return {
            children: [
                {
                    tag: 'input',
                    value: this.state.users[2].name,
                    on: {
                        input(e) {
                            this.state.users[2].name = e.target.value;
                            this.rerender();
                        }
                    }
                },
                {
                    children: this.state.users.map(user => Record(user))
                }
            ]
        };
    }
}
```

`memo()` allows you to define custom logic for halting rerendering. `memo()` can use `this`, similar to the `state()` and `render()` functions. If `memo()` returns a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value, the component will not rerender; otherwise, it will.

Neither `memo` nor `memo()` stop a component from rerendering itself; they only stop propagated rerender signals from ancestors. To stop a component from rerendering itself directly, you have to just *not* call `this.rerender()` or `this.setState` within it.

### The `key` property

Components can be given a key by assigning their `key` property. This must be a `string`. The key is passed to the top-level element of the component. To learn more, see @[keys](core-keys).

### The `binding` property

Components can be given a binding by assigning their `binding` property. This must be a `string`. The binding is passed to the top-level element of the component. To learn more, see @[bindings](core-bindings).

## Component producers

Similar to @[template producers](core-templates#template-producers--props), component producers are functions which produce components. These might take in props from other components or pieces of business logic. The `render()` function is always re-evaluated with the newest props taken into account, so you do not have to worry about stale values for props. Using component producers is an effective pattern for managing large applications in FRUIT, as you can utilize both the reactivity of components and the intricacies of small, modular parts.

See the `Record()` component producer in the `memo` example #[above](the-memo-and-memo-properties). 

## Putting components on the DOM

You can use any of several FRUIT methods such as `appendChild` and `create` to put FRUIT components on the DOM. See @[Putting FRUIT on the DOM](core-putting-on-dom) to learn more.