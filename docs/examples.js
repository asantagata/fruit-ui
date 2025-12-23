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
    })()
};