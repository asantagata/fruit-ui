# Keys

As FRUIT's `this.rerender()` rerenders an entire subtree (barring `memo`), it is necessary to dynamically keep track of and update children. Often, elements have several children. Sometimes, this is uncomplicated; if an element always has the same three children, identifying "which is which" in order to rerender them consistently is trivial. Sometimes, though, we have lists of child elements which might be reordered or have insertions and deletions. In this case, FRUIT does not have a mechanism to automatically identify that what was previously the first element is now the third element, and what was previously fifth is now gone. Instead, you have to tell FRUIT about your reordered lists using *keys.*

## Syntax

Keys must be a `string` and they must be unique among siblings. Keys can appear in components and templates alike. Note that a `key` in a top-level template does nothing; on components, `key` must appear in the component (i.e., alongside `render()`) instead.

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

## List without keys

(You'll find this example does not work. That's deliberate! See the explanation below.)

```{reorder-nokeys}
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

```{reorder-keys}
function Item(name, makeFirst, makeLast) {
    return {
        key: name,
        // ... the rest of Item is the same
    };
}

// the main component is the same
```

This same logic makes it easy to have lists with insertions, deletions, and updates to individual items. Keys make it easy to make dynamic element lists in FRUIT.