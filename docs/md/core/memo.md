# Memo

By default, FRUIT rerenders entire subtrees. That is to say: if component `Parent` has components `Child1` and `Child2` as children, then rerendering `Parent` will also cause `Child1`, `Child2`, and any further descendants to rerender as well. Sometimes this is superfluous or unnecessary, but with no compile step, FRUIT does not have any inherent mechanism to know that. To this end, `memo()` and `customMemo()` allow you to *tell* FRUIT that a component does not need to be rerendered.

## `memo()`

`memo()` is a function which returns any value. This function is called before the component is rerendered as part of an ancestor's rerender, and the returned value is compared against the previous stored return value of `memo()`. If the values are found to be the same, FRUIT will not rerender the component. 

The return value of `memo()` can be any *acyclic* (i.e., not self-referential) combination of objects, iterables (arrays, sets, maps), functions, and primitives. When a component with `memo()` is made to rerender as part of an ancestor's rerender, FRUIT will compare the old and new return values of `memo()` with a deep equality check.

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
        memo() { return user; }
    };
}

// ...

{
    state: {
        users: [
            {id: 1, name: 'Alice'},
            {id: 2, name: 'Bob'},
            {id: 3, name: 'Parlie'}
        ]
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

## `customMemo()`

`customMemo()` allows you to define custom logic for halting rerendering. This is useful for applications which use some custom business logic to decide whether to rerender. `customMemo()` can use `this`, similar to the `state()` and `render()` functions.

The component will rerender if and only if `customMemo()` returns `true` or a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value.

```{custom-memo}
function Record(user) {
    return {
        // the rest of Record is the same
        customMemo() { 
            return user.id % 2 === 1; 
        }
    };
}

// the main component is the same
```

If both `memo()` and `customMemo()` are present in a component, `customMemo()` takes precedence.

Neither `memo` nor `customMemo()` stop a component from rerendering *itself*; they only stop propagated rerender signals from ancestors. To stop a component from rerendering itself directly, you have to just *not* call `this.rerender()` or `this.setState` within it.