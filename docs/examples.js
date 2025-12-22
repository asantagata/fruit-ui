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
    }
};