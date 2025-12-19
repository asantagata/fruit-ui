const sidebar = {
    id: 'sidebar',
    children: [
        {
            tag: 'input',
            type: 'checkbox',
            id: 'chevron-input',
            autocomplete: 'off'
        },
        {
            id: 'sidebar-upper',
            children: [
                {
                    id: 'chevron',
                    tag: 'label',
                    for: 'chevron-input',
                    innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`
                },
                {
                    tag: 'a',
                    href: './',
                    id: 'logo',
                    children: [{tag: 'span', children: '🥭'}, ' FRUIT']
                }
            ]
        },
        {
            id: 'sidebar-index',
            children: [
                { name: 'FRUIT', url: './' },
            ].map(entry => ({
                tag: 'a',
                href: entry.url,
                children: entry.name
            }))
        }
    ]
}

const TokenTypes = {
    NEWLINE: 'newline', 
    WHITESPACE: 'whitespace', 
    ALPHANUMERIC: 'alphanumeric', 
    SYMBOLIC: 'symbolic', 
    DECLARE_KEYWORD: 'declare', 
    CTRLFLOW_KEYWORD: 'ctrlflow', 
    NUMBER: 'number', 
    FUNCTION: 'function', 
    OBJECT: 'object', 
    COMMENT: 'comment', 
    STRING: 'string',
    QUOTE: 'quote',
    THIS: 'this'
}

function codePointType(codePoint) {
    if (codePoint === 10)
        return TokenTypes.NEWLINE;
    if (codePoint === 32 || codePoint === 9)
        return TokenTypes.WHITESPACE;
    if (codePoint === 95 || (codePoint >= 65 && codePoint <= 90) || (codePoint >= 97 && codePoint <= 122) || (codePoint >= 48 && codePoint <= 57))
        return TokenTypes.ALPHANUMERIC;
    if (codePoint === 39 || codePoint === 34 || codePoint === 96)
        return TokenTypes.QUOTE;
    return TokenTypes.SYMBOLIC;
}

function tokenize(code) {
    let tokens = [], curToken = {type: undefined};
    for (const codePointContent of code) {
        const codePoint = codePointContent.codePointAt(0);
        const type = codePointType(codePoint);
        if (curToken.type === type) {
            curToken.text += codePointContent;
        } else {
            if (curToken.type)
                tokens.push(curToken);
            curToken = {text: codePointContent, type: type};
        }
    }
    if (curToken.type && curToken.type !== TokenTypes.WHITESPACE)
        tokens.push(curToken);
    if (tokens[tokens.length - 1].type === TokenTypes.NEWLINE)
        tokens.splice(tokens.length - 1, 1);
    return tokens;
}

function SyntaxHighlighting(code) {
    const declareKeywords = new Set(['const', 'function', 'let', 'new', 'document']);
    const ctrlflowKeywords = new Set(['break', 'do', 'while', 'for', 'in', 'of', 'if', 'else', 'return', 'import', 'from']);
    const tokens = tokenize(code);
    let currentType = null;
    let insideStringBreak = false;
    let lastOpeningQuote = null;
    let lastOpeningQuoteInsideStringBreak = null;
    for (let i = 0; i < tokens.length; i++) {
        let skipThisCurrentTypeAssignment = false;
        const token = tokens[i];
        if (currentType !== TokenTypes.STRING && token.type === TokenTypes.SYMBOLIC && token.text === '//')
            currentType = TokenTypes.COMMENT;
        else if (currentType === TokenTypes.COMMENT && token.type === TokenTypes.NEWLINE)
            currentType = null;
        else if (currentType !== TokenTypes.COMMENT && token.type === TokenTypes.QUOTE) {
            if (insideStringBreak) {
                if (currentType === TokenTypes.STRING && lastOpeningQuoteInsideStringBreak === token.text) {
                    currentType = null;
                    lastOpeningQuoteInsideStringBreak = null;
                } else if (!lastOpeningQuoteInsideStringBreak) {
                    currentType = TokenTypes.STRING;
                    lastOpeningQuoteInsideStringBreak = token.text;
                }
            } else {
                if (currentType === TokenTypes.STRING && lastOpeningQuote === token.text) {
                    currentType = null;
                    lastOpeningQuote = null;
                } else if (!lastOpeningQuote) {
                    currentType = TokenTypes.STRING;
                    lastOpeningQuote = token.text;
                }
            }
            
        }
        else if (currentType === TokenTypes.STRING && token.text.startsWith('${')) {
            currentType = null;
            insideStringBreak = true;
        } else if (insideStringBreak && token.text.includes('}')) {
            currentType = TokenTypes.STRING;
            insideStringBreak = false;
            skipThisCurrentTypeAssignment = true;
        }

        if (currentType && !skipThisCurrentTypeAssignment) 
            token.type = currentType;
        else if (token.type === TokenTypes.QUOTE)
            token.type = TokenTypes.STRING;

        if (token.type === TokenTypes.ALPHANUMERIC) {
            if (Number.isFinite(+token.text)) {
                token.type = TokenTypes.NUMBER;
            } else if (i < tokens.length - 1 && tokens[i + 1].text.startsWith('(')) {
                token.type = TokenTypes.FUNCTION;
            } else if (token.text[0] === token.text[0].toUpperCase()) {
                token.type = TokenTypes.OBJECT;
            } else if (declareKeywords.has(token.text)) {
                token.type = TokenTypes.DECLARE_KEYWORD;
            } else if (ctrlflowKeywords.has(token.text)) {
                token.type = TokenTypes.CTRLFLOW_KEYWORD;
            } else if (token.text === 'this') {
                token.type = TokenTypes.THIS;
            }
        }
    }

    let mIndent = Number.POSITIVE_INFINITY;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === TokenTypes.WHITESPACE && (i === 0 || tokens[i - 1].type === TokenTypes.NEWLINE)) {
            mIndent = Math.min(mIndent, token.text.length);
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === TokenTypes.WHITESPACE && (i === 0 || tokens[i - 1].type === TokenTypes.NEWLINE)) {
            token.text = token.text.substring(mIndent + 1);
        }
    }
    
    return {
        tag: 'pre',
        children: {
            tag: 'code',
            children: tokens.map(({text, type}) => ({tag: 'span', class: `token ${type}`, children: text}))
        }
    };
}

function Example(code, result) {
    return {
        class: 'example',
        children: [
            SyntaxHighlighting(code),
            {
                class: 'resultbox',
                children: result
            }
        ]
    }
}

function initializeArticle(document, replaceWith, SNIPPETS) {
    replaceWith(document.getElementById('sidebar'), sidebar);

    Array.from(article.getElementsByTagName('pre')).forEach(pre => {
        const example = Example(pre.innerText, SNIPPETS[pre.dataset.ref]);
        replaceWith(pre, example);
    });
}
    
    