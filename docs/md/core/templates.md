# Templates

Templates are the fundamental building-block of FRUIT. They are JavaScript objects representing elements in HTML. Any valid HTML can be written in FRUIT using templates.

```{demo}
{
    children: [
        {tag: 'p', children: 'FRUIT is...'},
        {tag: 'ul', children: [
            {tag: 'li', children: 'simple,'},
            {
                tag: 'li', 
                style: {color: 'pink', fontFamily: 'serif'}, 
                children: 'stylized,'
            },
            {
                tag: 'li', children: {
                    tag: 'button', 
                    on: {click() {alert('See?')}}, 
                    children: 'interactive,'
                }
            },
            {
                tag: 'li', 
                children: {
                    tag: 'b', 
                    children: {
                        tag: 'u', 
                        children: {
                            tag: 'i',
                            children: 'nested,'
                        }
                    }
                }
            },
            {
                tag: 'li', children: [
                    'and ', RainbowText('modular'), '.' // (not provided)
                ]
            }
        ]}
    ]
}
```

## Syntax

Templates are JavaScript objects representing HTML elements. Although FRUIT was implemented in vanilla JavaScript with JSDoc type annotations, here is a TypeScript-based signature for FRUIT templates (it's more readable this way):

```
type Template = Partial<({
    tag: string,
    class: string | string[] | Record<string, any>,
    id: string,
    style: CSSStyleDeclaration,
    dataset: Record<string, string>,
    on: Record<string, (() => void) | ((event: Event) => void)>,
    children: Template | Component | string | (Template | Component | string)[],
    innerHTML: string,
    cloneFrom: HTMLElement,
    HTML: string,
    xmlns: string,
    key: string,
    binding: string
} & Record<string, string>)>
```

The following is a more thorough guide to templates.

### No properties required

As you may have noticed, `Template` type definition above is wrapped in the `Partial<...>` type function. This means that, while templates *can* have any of several properties, there are 0 *required* properties. The "default" template, `{}`, corresponds to `<div></div>`.

### The `tag` property

The `tag` property defines the element's tag. It must be a `string`, e.g., `'div'` or `'p'` or `'fieldset'`. As in HTML, it is case-insensitive. If omitted, `'div'` is used.

### The `class` property

The `class` property defines the element's class. This can be one of three types:
- a string, which is treated as the element's class name (e.g., `{class: 'medium beige'}` corresponds to `<div class="medium beige"></div>`);
- an array of strings, which are treated as the element's class list (e.g., `{class: ['large', 'green']}` corresponds to `<div class="large green"></div>`);
- or an object, where each `{key: value}` pair consists of a class name and a condition which decides whether that class name will be used (e.g., `{class: {red: true, small: Math.random() < 0.5}}` corresponds to either `<div class="red small"></div>` or `<div class="red"></div>`.) While more abstruse in its syntax, this makes it far easier to use conditional class names. As with any JavaScript object attribute, you can reference classes that are not [valid JavaScript identifiers](https://developer.mozilla.org/en-US/docs/Glossary/Identifier) by wrapping them in quotes, e.g., `{class: {'light-blue': true}}`.

### The `id` property

The `id` property is a `string` defining the element's ID.

### The `style` property

The `style` property defines the element's style. It must be a `CSSStyleDeclaration`, which is the kind of object returned by `HTMLElement.style` and is indexable by camel-case versions of most CSS property names. `{style: {backgroundColor: 'green', borderTopLeftRadius: '20px'}}` corresponds to `<div style="background-color: green; border-top-left-radius: 20px"></div>`.

### The `dataset` property

The `dataset` property defines the element's [dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset). It must be a `Record<string, string>`. As always when working with element datasets, keys are automatically converted from camel-case to `data`-prefixed kebab-case and vice-versa, e.g., `{dataset: {myName: 'asantagata', userID: 'user 5'}}` corresponds to `<div data-my-name="asantagata" data-user-i-d="user 5"></div>`.

### The `on` property

The `on` property defines the element's listeners. It must be a `Record<string, (() => void) | ((event: Event) => void)>`. The name of the function is taken as the type of the listener. Despite this type signature, you must use named methods rather than anonymous (arrow-based) functions for listeners. This allows `this`-related logic to be consistent; see @[Superpowered "this"](core-this#---vs-function) for more on `this`-related syntax.

An element can have listeners for any valid [DOM event](https://www.w3schools.com/jsref/dom_obj_event.asp).

You can also have listeners to the `mount` event, which takes place when the element is mounted to the DOM. (In special cases, this can happen more than once; see @[Re-mounting](core-keys#re-mounting).)

```{on}
{
    tag: 'button',
    children: 'Click or right-click me!',
    on: {
        click() { alert('You clicked!') },
        contextmenu() { alert('You right-clicked!') },
        mount() { console.log("Hello! Here's my 'this': ", this) }
    }
}
```

Listeners always have access to the `this.target` property. Inside of components, they also have access to other `this` properties. See @[Components](core-components) and @[Superpowered "this"](core-this) to learn more.

### The `children` property

The `children` property defines the element's children. This can be a `string`, a `Template`, a `Component`, or an `Array` of any these types. `Array`s are interpreted as a list of child nodes:
```
{
    children: [
        'Child node #1 is a text node.',
        'Child node #2 is also a text node.',
        {
            tag: 'b', 
            children: 'Child node #3 is a Template.'
        },
        {
            render() {
                return {
                    tag: 'u', 
                    children: 'Child node #4 is a Component.'
                }
            }
        }
    ]
}
```

If `children` is a `string`, `Templte` or `Component`, the given value is the element's only child. (This is equivalent to passing an array with 1 element.)

If the `children` property is absent, an empty array (`[]`), or explicitly set to `undefined`, the element has no children.

### The `innerHTML` property

The `innerHTML` property defines the element's innerHTML as a `string`. This overrides the `children` property, if it exists. The string is not validated or tampered with by FRUIT.

### The `cloneFrom` property

The `cloneFrom` property replaces the element with a clone of a given `HTMLElement`. This overrides all other properties.

### The `HTML` property

The `HTML` property defines the element as an HTML `string`. This overrides all other properties (except for `cloneFrom`, which has precedence over it.)

### The `xmlns` property

The `xmlns` property is a `string` used with `document.createElementNS()` to identify the [XML namespace](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Namespaces_crash_course) of the element, if it is non-standard. This includes all [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) and [MathML](https://developer.mozilla.org/en-US/docs/Web/MathML) elements.

### The `key` property

Templates can be given a key by assigning their `key` property. This must be a `string`. To learn more, see @[keys](core-keys).

### The `binding` property

Templates can be given a binding by assigning their `binding` property. This must be a `string`. To learn more, see @[bindings](core-bindings).

### Other properties

All other properties on HTML elements, such as `src` on `<img>`, `href` on `<a>`, or `type` on `<input>` can be set with the name of the property. As with any JavaScript object attribute, you can reference properties that are not [valid JavaScript identifiers](https://developer.mozilla.org/en-US/docs/Glossary/Identifier) by wrapping them in quotes, e.g., `{tag: 'button', 'aria-role': 'Close'}`.

## Template producers & props

FRUIT does not offer its own mechanism for templates to pass "[props](https://react.dev/learn/passing-props-to-a-component)" to one another. Instead, this can be done by creating *template producers*, or functions which return a template.

```{props}
function Circle(color) {
    return {
        style: {
            borderRadius: '50%',
            background: color
        }
    }
}

// ...

{
    style: {display: 'flex', gap: '1rem'},
    children: [
        Circle('#d35176'),
        Circle('#ffc861'), 
        Circle('#689f6d')
    ]
}
```

You can pass any type as a "prop" in this way, including other templates or components.

While these parallel the notion of reusable *components* from other front-end frameworks, they are not stateful or reactive, unlike FRUIT's @[Components](core-components).

## Putting templates on the DOM

You can use any of several FRUIT methods such as `appendChild` and `create` to put FRUIT templates on the DOM. See @[Putting FRUIT on the DOM](core-putting-on-dom) to learn more.