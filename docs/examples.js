export const examples = {
    'core-fun': {
        tag: 'p',
        children: [
            'Writing in ',
            {tag: 'strong', style: {color: '#2a68d4'}, children: 'FRUIT'},
            ' is fun!'
        ]
    },
    'core-counter': {
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
        }
    },
    'templates-demo': {
        children: [
            {tag: 'p', children: 'FRUIT is...'},
            {tag: 'ul', children: [
                {tag: 'li', children: 'simple,'},
                {tag: 'li', style: {color: 'var(--pink)', fontFamily: 'serif'}, children: 'stylized,'},
                {tag: 'li', children: {tag: 'button', on: {click() {alert('See?')}}, children: 'interactive,'}},
                {tag: 'li', children: {tag: 'b', children: {tag: 'u', children: {tag: 'i', children: 'nested,'}}}},
                {tag: 'li', children: ['and ', {
                    tag: 'span',
                    class: 'rainbow-text',
                    children: [
                        {tag: 'span', children: 'm', style: {color: '#FF659B'}},
                        {tag: 'span', children: 'o', style: {color: '#FF7691'}},
                        {tag: 'span', children: 'd', style: {color: '#FF8688'}},
                        {tag: 'span', children: 'u', style: {color: '#FF977E'}},
                        {tag: 'span', children: 'l', style: {color: '#FFA774'}},
                        {tag: 'span', children: 'a', style: {color: '#FFB86B'}},
                        {tag: 'span', children: 'r', style: {color: '#FFC861'}},
                    ]
                }, '.']}
            ]}
        ]
    },
    'templates-on': {
        tag: 'button',
        children: 'Click or right-click me!',
        on: {
            click() { alert('You clicked!') },
            contextmenu() { alert('You right-clicked!') }
        }
    },
    'templates-props': {
        class: 'props-demo',
        children: ['#d35176', '#ffc861', '#689f6d'].map(color => ({
            style: {background: color}
        }))
    },
    'components-memo': (() => {
        function Record(user) {
            return {
                render() {
                    return {
                        class: 'record',
                        children: [
                            {tag: 'p', children: `ID: ${user.id}`},
                            {tag: 'p', children: `Name: ${user.name}`},
                            {tag: 'p', children: `Last rendered: ${Date.now()}`},
                        ]
                    }
                },
                memo: user
            }
        }

        // ...

        return {
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
                    class: 'memo-demo',
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
                }
            }
        }
    })(),
    'keys-resetable-counter': (() => {
        const Counter = {
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
            }
        };

        return {
            state() {
                return {key: 0}
            },
            render() {
                return {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--md)'
                    },
                    children: [
                        {...Counter, key: `${this.state.key}`},
                        {
                            tag: 'button',
                            children: 'Reset',
                            on: {
                                click() {
                                    this.setState.key(this.state.key + 1);
                                }
                            },
                            key: 'reset'
                        }
                    ]
                }
            }
        }
    })(),
    'keys-reorder': (include) => {
        function Item(name, makeFirst, makeLast) {
            return {
                state() {return {name}},
                render() {
                    return {
                        class: 'keys-demo-list-item',
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
                },
                ...(include ? {key: name} : {})
            }
        }

        return {
            state() { return { list: ['Ape', 'Bomb', 'Chin', 'Duck', 'Ego'] }; },
            render() {
                return {
                    class: 'keys-demo-list',
                    children: this.state.list.map(name => Item(
                        name,
                        () => this.setState.list([name, ...this.state.list.filter(n => n !== name)]),
                        () => this.setState.list([...this.state.list.filter(n => n !== name), name]),
                    ))
                };
            }
        }
    },
    'bindings-example': (() => {
        const Component = {
            render() {
                return {
                    class: 'keys-demo-list-item',
                    style: {color: 'black'},
                    children: 'Component text'
                }
            }
        }

        return {
            render() {
                return {
                    class: 'keys-demo-list',
                    children: [
                        {
                            children: 'Child text',
                            class: 'keys-demo-list-item',
                            style: {color: 'black'},
                            binding: 'my-child'
                        },
                        {
                            ...Component,
                            binding: 'my-component'
                        },
                        {
                            tag: 'button',
                            children: 'Make child blue',
                            on: {
                                click() {
                                    this.bindings['my-child'].element.style.color = 'rgb(42, 104, 212)';
                                }
                            }
                        },
                        {
                            tag: 'button',
                            children: 'Make component blue',
                            on: {
                                click() {
                                    this.bindings['my-component'].element.style.color = 'rgb(42, 104, 212)';
                                }
                            }
                        },
                        {
                            tag: 'button',
                            children: 'Reset child',
                            on: {
                                click() {
                                    this.bindings['my-child'].rerender();
                                }
                            }
                        },
                        {
                            tag: 'button',
                            children: 'Reset component',
                            on: {
                                click() {
                                    this.bindings['my-component'].rerender();
                                }
                            }
                        },
                        {
                            tag: 'button',
                            children: 'Reset all',
                            on: {
                                click() {
                                    this.rerender();
                                }
                            }
                        }
                    ]
                }
            }
        }
    })(),
    'conditional-children': {
        state() {
            return {condition: false}
        },
        render() {
            return {
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
        }
    }
};