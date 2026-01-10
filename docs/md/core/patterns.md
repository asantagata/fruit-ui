# Patterns

FRUIT strives to give the user freedom to design their web programs in any way they like, permitting as much flexibility as the underlying JavaScript object syntax allows. While not express features of FRUIT, the following are some patterns and tricks that allow you to accomplish non-obvious tasks.

## Conditional child elements

The spread operator (`...`) and ternary operator (`? :`) can be used to create conditional child elements:

```{conditional-children}
{
    children: [
        {
            tag: 'button', 
            children: 'Toggle this ↓', 
            on: {click() {
                this.setState.condition(!this.state.condition)
            }}
        },
        ...(this.state.condition 
            ? [{tag: 'p', children: 'Hello!'}]
            : []
        )
    ]
}
```

## Global context

FRUIT does not by default come with *global context*, i.e., a state that can be accessed by any template or component and trigger a global rerender. However, it is very easy to manufacture this using the tools FRUIT provides.

There are two core design patterns FRUIT applications:

- Some FRUIT applications have a top-level FRUIT component, usually called `App`. This is the sole piece of FRUIT code which is @[appended to the DOM](core-putting-on-dom) in the entire application (the only "insertion point"); all other FRUIT code is accessed as `App`'s descendants. The [FRUIT template repo](https://github.com/asantagata/fruit-ui-template) provides an example structure for this kind of app.
- Others have multiple insertion points. You might, for instance, have one top-level component for your `Sidebar`, one for your `Navbar`, and one for your `Footer`, which are each appended to the DOM individually.

The approach to creating global context is similar but slightly varies with these design patterns.

### Global context (one insertion point)

First, create `context.js`:

```
const context = {
    user: { ... },
    session: { ... },
    data: { ... },

    // any other info you like

    rerender: () => {}
};

export default context;
```

Then, inside the top-level component:

```
import context from "./utils/context.js";

export default function App() {
    return {
        state() {
            context.rerender = () => this.rerender();
            return { ... };
        },
        render() { ... }
    };
}
```

Now, once the `App` component's `state()` method has been called, `context.rerender()` will rerender `App` and therefore everything inside using the new value of `context`. From here, you can set up your own custom methods, like [setters with side-effects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set), to control rerendering further.

Note that, as of `state()` being called, `App`'s `this.rerender()` has not yet been configured since `this.render()` has not yet run. As such, we cannot assign the function directly (i.e., `context.rerender = this.rerender`) because it is currently the no-op function `() => {}`. Instead, passing by reference (i.e., `() => this.rerender()`) allows us to access a reference to the up-to-date value of `this.rerender()` as desired.

### Global context (several insertion points)

Having several insertion points slightly complicates the matter of context.

First, create `context.js`:

```
const context = {
    user: { ... },
    session: { ... },
    data: { ... },

    // any other info you like

    rerenders: [],
    rerender: () => context.rerenders.forEach(r => r())
};

export default context;
```

Then, inside of each top-level component's `state()` method:

```
state() {
    context.rerenders.push(() => this.rerender());
    return { ... };
}
```

This is the same logic, only with multiple methods in `rerenders` wrangled by the one `rerender` method.