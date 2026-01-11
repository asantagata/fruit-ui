# Bindings

FRUIT components have stateful reactivity, meaning it is never *necessary* to do direct DOM manipulation; every DOM property *can* be dependent on a manipulated state as needed. However, unlike most other frameworks, FRUIT gives you tools to do fine-grained DOM manipulation on your templates and components if you like; sometimes, a full-fledged component rerender just isn't necessary.

*Bindings* are references to the descendants of a component. They allow you to target, apply updates to, or even entirely rerender a specific descendant.

## Syntax

### Assigning bindings

The `binding` property is a `string`, and it must be unique among the descendants of a component. Bindings can appear in components and templates alike. A `binding` in a top-level template does nothing; on components, `binding` must appear in the component (i.e., alongside `render()`) instead. To access the top-level component from within that component, use `this.element` or `this.rerender()` instead.

### Defining "descendants"

Bindings can be accessed through `this.bindings`. Bindings are grouped by nearest component ancestor, so any descendant of some ancestor can reference any other descendant by its binding. A component can be accessed by any binding in their group, but can only access *its own* descendants by binding.

The "descendants" of a component are any templates or components whose *nearest component ancestor* is that component. The following color-coded tree demonstrates this in more detail:

```[tree]
App/pink;pink
├─div/pink;pink
│ ├─p/pink;pink
│ └─FieldsetContainer/pink;orange
│   └─fieldset/pink+orange;orange
└─Listicle/pink;green
  ├─ul/green;green
  │ ├─li/green;green
  │ └─SpecialLI/green;blue
  └─Form/green;pale
    └─input/pale;pale
```

In terms of bindings:
- `[[green]]Listicle` can access `[[green]]ul`, `[[green]]li`, `[[blue]]SpecialLI`, and `[[object]]Form`, and can be accessed by `[[pink]]App`, `[[pink]]div` and `[[pink]]p`.
- `[[blue]]SpecialLI` can access nothing, and can be accessed by `[[green]]li`, `[[green]]ul`, and `[[green]]Listicle`.
- `[[green]]li` can access `[[green]]ul`, `[[blue]]SpecialLI`, `[[object]]Form`, and itself, and can be accessed by `[[green]]ul`, `[[green]]Listicle`, and itself.
- `[[orange]]fieldset` can only access itself, and can only be accessed by `[[orange]]FieldsetContainer` and itself.

That is: everything can access everything else in its same color (except the top-most component, which can be accessed with the `this.element` and `this.rerender()` properties instead), and everything can be accessed by everything in the color of the branch pointing to it.

### Using bindings

There are two properties you can utilize on bindings:
- `this.bindings['binding-name'].element` returns a reference to that element on which you can perform whatever DOM manipulation you like.
- `this.bindings['binding-name'].rerender()` rerenders only the subtree starting from that descendant.

```{bindings}
const Component = {
    render() {
        return {
            style: {color: 'black', transition: 'color 0.2s ease-in-out'},
            children: 'Component text'
        };
    }
}

function Button(text, listener) {
    return {tag: 'button', ...};
}

// ...

{
    render() {
        return {
            children: [
                {
                    children: 'Child text',
                    style: {color: 'black', transition: 'color 0.2s ease-in-out'},
                    binding: 'my-child'
                },
                {
                    ...Component,
                    binding: 'my-component'
                },
                Button(
                    'Make child blue',
                    () => this.bindings['my-child'].element.style.color = 'blue'
                ),
                Button(
                    'Make component blue',
                    () => this.bindings['my-component'].element.style.color = 'blue'
                ),
                Button(
                    'Reset child',
                    () => this.bindings['my-child'].rerender()
                ),
                Button(
                    'Reset component',
                    () => this.bindings['my-component'].rerender()
                ),
                Button(
                    'Reset all',
                    () => this.rerender()
                )
            ]
        };
    }
}
```

Notice the smooth transition; both the `[[string]]my-child` and `[[string]]my-component` elements have `transition: 'color 0.2s ease-in-out'`. Since FRUIT updates properties individually rather than replacing elements completely, transitions such as these are possible on rerenders.