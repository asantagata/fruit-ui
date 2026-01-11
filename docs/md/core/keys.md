# Keys

As FRUIT's `this.rerender()` rerenders an entire subtree (barring `memo`), it is necessary to dynamically keep track of and update children. Often, elements have several children. Sometimes, this is uncomplicated; if an element always has the same three children, identifying "which is which" in order to rerender them consistently is trivial. Sometimes, though, we have lists of child elements which might be reordered or have insertions and deletions. In this case, FRUIT does not have a mechanism to automatically identify that what was previously the first element is now the third element, and what was previously fifth is now gone. Instead, you have to tell FRUIT about your reordered lists using *keys.*

## Syntax

Keys are very simple. Keys must be a `string` and they must be unique among siblings. On components, `key` can appear either in the component (i.e., alongside `render()`) or in the top-level element template. If both are present, the component key is prioritized.

In order for keys to be effective, *every* component or template in a set of siblings must utilize them. (`string` siblings do not need keys; they have their own rerender step that uses adjacent components and templates as anchors.)

### Re-mounting

Note that, in order to be re-ordered, elements must sometimes be un-mounted from and re-mounted to the DOM. When this happens, the re-mounted element's on-mount listener (and those of any children) are called, and any on-load animations are triggered. `this.state`, however, is persistent; if needed, you can utilize a state variable (say, `this.state.alreadyMounted`) to keep track of logic internally and stop on-mount listeners from firing again. 

Be aware, however, that the re-mounted elements may not be the ones you expect; reordering `A B C` to `B A C`, for instance, can be achieved by moving `A` forward or by moving `B` backward. FRUIT uses an [longest increasing subsequence algorithm](https://en.wikipedia.org/wiki/Longest_increasing_subsequence#Efficient_algorithms) to find reorderings with minimal changes, and prefers moving items backward.

## Rerendering without keys

When keys are not present, it is assumed that the "old" and "new" lists of children correspond based on index alone. If there is a differing number of children, any insertions or deletions take place at the end of the list.

## Only technically siblings...

Take a look at the `Switcheroo` component:

```
const Switcheroo = {
    state: { myCondition: true },
    render() {
        return {
            on: {
                click() { 
                    this.setState.myCondition(!this.state.myCondition) 
                }
            },
            children: this.state.myCondition ? Component1 : Component2
        };
    }
}
```

While `Component1` and `Component2` never appear together, they are *siblings* in that they differ but share a parent. If they are stateful and they do not have keys in their unseen component or template definitions, this is a problem:
- On first load, `myCondition` is `true`, so `Component1` is displayed;
- Later, `Switcheroo` is clicked, so `myCondition` is toggled and a rerender is triggered;
- FRUIT sees that `Switcheroo` has one child both the pre- and post-rerender, so it assumes these children correspond;
- FRUIT binds `Component2` to `Component1`'s state!

When using ternary operators like these on components, it is a good idea to use keys to differentiate them.

## Using keys to wipe state

Inversely, you can deliberately use keys to "trick" FRUIT into deleting and re-creating a child, wiping its state and hard-replacing its content:

```{counter}
const Counter = {
    state() { return { i: 0 }; },
    render() { return { ... } } // same as before
};

// ...

{
    state() { return { key: 0 }; },
    render() {
        return {
            children: [
                {...Counter, key: `counter-${this.state.key}`},
                {
                    tag: 'button',
                    children: 'Reset',
                    on: {
                        click() {

                            // change Counter's key, forcing a rerender
                            this.setState.key(this.state.key + 1);

                        }
                    },
                    key: 'reset'
                }
            ]
        }
    }
}
```

Note that for this version of `Counter`, we *must* use `state()` rather than `state`. If we used `state: { i: 0 }`, the following issue would emerge:
- As the `Counter` component is processed, the object `{ i: 0 }` is copied by reference as `Counter`'s `this.state` value.
- The `Counter` component is clicked a few times, incrementing `i`. Now we have `this.state = { i: 3 }`. Keeping in mind that this was copied by reference as all objects are, we also have `Counter.state = { i: 3 }`.
- The "reset" button is clicked, incrementing the `Counter` component's key.
- As the main component rerenders, FRUIT sees that the keys on the child component have gone from `['counter-0', 'reset']` to `['counter-1', 'reset']`. So the existing `Counter` component is deleted (as the key `'counter-0'` is gone) and a new `Counter` component is created (with the key `'counter-1'`) ...
- ... but the `Counter.state` object is still `{ i: 3 }`. So the new `Counter` component's `this.state` object is also `{ i: 3 }`.
If you want to utilize this trick, make sure to use the functional definition of `state()`!

## List without keys

(You'll find this example does not work. That's deliberate! See the explanation below.)

```{without}
function Item(name, makeFirst, makeLast) {
    return {
        state: { name },
        render() {
            return {
                children: [
                    `props name: ${name}, state name: ${this.state.name}`,
                    {
                        children: [
                            {
                                tag: 'button',
                                children: 'make me first',
                                on: {click() { makeFirst() }}
                            },
                            {
                                tag: 'button',
                                children: 'make me last',
                                on: {click() { makeLast() }}
                            }
                        ]
                    }
                ]
            };
        }
    }
}

// ...

{
    state: { list: ['Ape', 'Bomb', 'Chin', 'Duck', 'Ego'] },
    render() {
        return {
            children: this.state.list.map((name, id) => Item(
                name, id,
                () => this.setState.list([
                    name, 
                    ...this.state.list.filter(n => n !== name)
                ]),
                () => this.setState.list([
                    ...this.state.list.filter(n => n !== name), 
                    name
                ]),
            ))
        };
    }
}
```

You might notice that the "props name" and "state name" start to differ and certain buttons stop working. Since listeners are not re-evaluated, the listener on each button becomes stale, referring to the same name as the "props" name. If "Ape" is moved from first to last, for instance, then the first card's listeners will still be "move Ape to last place," even though the card's props name now reads "Bomb." This is problematic and means our re-orderable list is very unstable.

### Lists with keys

With keys, fixing this example is very easy. By giving each `Item` a key equal to its name, we can easily instruct FRUIT on how to dynamically re-order them.

```{with}
function Item(name, makeFirst, makeLast) {
    return {
        key: name,
        // ... the rest of Item is the same
    };
}

// the main component is the same
```

This same logic makes it easy to have lists with insertions, deletions, and updates to individual items. Keys make it easy to make dynamic element lists in FRUIT.