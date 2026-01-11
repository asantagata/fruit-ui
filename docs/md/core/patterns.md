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
                this.setState.condition(!this.state.condition);
            }}
        },
        ...(this.state.condition 
            ? [{tag: 'p', children: 'Hello!'}]
            : []
        )
    ]
}
```

## File organization

Like any larger project, your FRUIT app can become quite complex and messy if limited to one `[[pink]].js` file or, slightly scarier, one `<script>` tag. To this end, it may be useful to distribute your FRUIT project across multiple files.

The simplest way to do this is with [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

One simple pattern to follow is to make each file export one component or template producer, then import and reuse these as needed. Here is an example of what this might look like:

```
// inside components/NumberInput.js

export default function NumberInput(value, onChange, {min = '', max = ''}) {
    return {
        state: { value },
        return {
            tag: 'input',
            type: 'number',
            value, min, max
            on: {
                change() {
                    let currentValue = this.target.valueAsNumber;
                    if ((currentValue >= min || min === '') && (currentValue <= max || max === '')) {
                        this.state.value = currentValue;
                        onChange(currentValue);
                    } else {
                        this.rerender(); // reset
                    }
                }
            }
        }
    }
}
```

And the use of `NumberInput` inside another component:

```
// inside components/Form.js

import NumberInput from "./NumberInput.js";

export default function Form() {
    children: [
        {tag: 'label', children: 'Enter your favorite number: '},
        NumberInput(
            0, (value) => alert(`Your favorite number is: ${value}.`)
        );
    ]
}
```

This pattern allows you to distribute your code neatly and promote code reuse. If you would like to initialize a project using this kind of organization, you can use the [FRUIT project template](https://github.com/asantagata/fruit-ui-template).

## Global context

FRUIT does not by default come with *global context*, i.e., a state that can be accessed by any template or component and trigger a global rerender. However, it is very easy to manufacture this using the tools FRUIT provides.

There are two core design patterns FRUIT applications:

- Some FRUIT applications have a top-level FRUIT component, usually called `App`. This is the sole piece of FRUIT code which is @[appended to the DOM](core-putting-on-dom) in the entire application (the only "insertion point"); all other FRUIT code is accessed as `App`'s descendants. The [FRUIT template repo](https://github.com/asantagata/fruit-ui-template) provides an example structure for this kind of app.
- Others have multiple insertion points. You might, for instance, have one top-level component for your `Sidebar`, one for your `Navbar`, and one for your `Footer`, which are each appended to the DOM individually.

The approach to creating global context is similar but slightly varies with these design patterns.

### Global context (one insertion point)

First, create `[[pink]]context.js`:

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

Note that, as of `state()` being called, `App`'s `this.rerender()` has not yet been configured since `App`'s `render()` method has not yet run. As such, we cannot assign the function directly (i.e., `context.rerender = this.rerender`) because `this.rerender` is currently the no-op function `() => {}`. Instead, passing by reference (i.e., `() => this.rerender()`) allows us to access a reference to the up-to-date value of `this.rerender()` as desired.

### Global context (several insertion points)

Having several insertion points slightly complicates the matter of context.

First, create `[[pink]]context.js`:

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

This is the same logic, only with multiple methods in `context.rerenders` wrangled by the one `context.rerender()` method.