import { Router, navigate } from "./router.js"; // change to npm link when available
import { examples } from "./examples.js";

const ARTICLES = [
    {title: 'FRUIT', url: 'index', mdPath: './md/index.md', section: 'core', 
        results: {
            fun: examples['core-fun'],
            counter: examples['core-counter']
        }
    },
    {title: 'Getting Started', url: 'getting-started', mdPath: './md/getting-started.md', section: 'core'}
];

const Sidebar = {
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
                    id: 'logo',
                    children: [{tag: 'span', children: '🥭'}, ' FRUIT'],
                    on: {click() {navigate('')}}
                }
            ]
        },
        {
            id: 'sidebar-index',
            children: Object.entries(Object.groupBy(ARTICLES, a => a.section)).flatMap(([sectionName, entries]) => ([
                    {class: 'section-name', children: sectionName.toUpperCase()},
                    ...entries.map(entry => ({
                        class: 'index-entry',
                        children: entry.title,
                        on: {click() {
                            navigate(`${entry.section}-${entry.url}`);
                            document.getElementById('chevron-input').checked = false;
                        }}
                    }))
                ]
            ))
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
    THIS: 'this',
    CURLY: 'curly'
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
    if (codePoint === 123 || codePoint === 125 || codePoint === 36)
        return TokenTypes.CURLY;
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

function JSSyntaxHighlighting(code, mode) {
    const declareKeywords = new Set(['const', 'function', 'let', 'new', 'document']);
    const ctrlflowKeywords = new Set(['break', 'do', 'while', 'for', 'in', 'of', 'if', 'else', 'return', 'import', 'from', 'as']);
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
            } else if (ctrlflowKeywords.has(token.text) || (i > 0 && (tokens[i - 1].text.endsWith('<') || tokens[i - 1].text.endsWith('</')))) {
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
        tag: 'code',
        class: `${mode}-code`,
        children: tokens.map(({text, type}) => ({tag: 'span', class: `token ${type === TokenTypes.CURLY ? TokenTypes.SYMBOLIC : type}`, children: text}))
    };
}

function SyntaxHighlighting(code, mode = 'dark', lang = 'js') {
    switch (lang) {
        case 'shell': {
            const words = code.split(' ');
            return {
                tag: 'code',
                class: `${mode}-code`,
                children: [
                    {tag: 'span', class: 'token ctrlflow', children: words[0]},
                    ' ',
                    {tag: 'span', class: 'token alphanumeric', children: words.slice(1).join(' ')}
                ]
            }
        }
        case 'js': return JSSyntaxHighlighting(code, mode);
    }
}

function Markdown(text, article) {
    const lines = text.split('\n').filter(t => t.trim().length > 0);

    // recognize codeblocks
    let currentCodeblock = null;
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (currentCodeblock !== null) {
            if (line.startsWith('```')) {
                const code = currentCodeblock.join('\n');
                const pre = {
                    tag: 'pre',
                    children: SyntaxHighlighting(code)
                };
                if (line.startsWith('```{')) {
                    const tag = line.trim().slice(4, -1);
                    lines.splice(i, currentCodeblock.length + 2, {
                        class: 'example',
                        children: [
                            pre,
                            {class: 'resultbox', children: article.results[tag]}
                        ]
                    });
                } else {
                    lines.splice(i, currentCodeblock.length + 2, pre);
                }
                currentCodeblock = null;
            } else {
                currentCodeblock.unshift(line);
            }
        } else {
            if (line.startsWith('```')) {
                currentCodeblock = [];
            }
        }
    }

    // use proper tags for singular non-Ps
    const paragraphs = lines.map(text => {
        if (text.children) return text;
        if (text.startsWith('## ')) return {tag: 'h1', children: [text.slice(3)]}
        if (text.startsWith('### ')) return {tag: 'h2', children: [text.slice(4)]}
        if (text.startsWith('- ')) return {tag: 'li', children: [text.slice(2)]}
        return {tag: 'p', children: [text]}
    });

    // recognize inline md
    const delimeters = [
        {split: /(\`[^\`]+?\`)/g, into: (t) => {
            const slicedT = t.slice(1, -1);
            if (/^{\w+}/.test(slicedT)) {
                const closingCurlyIndex = slicedT.indexOf('}');
                const lang = slicedT.slice(1, closingCurlyIndex), code = slicedT.slice(closingCurlyIndex + 1);
                return SyntaxHighlighting(code, 'light', lang);
            }
            return SyntaxHighlighting(slicedT, 'light');
        }},
        {split: /(\[[^\]]+?\]\([^\)]+?\))/g, into: (t) => {
            const slicedT = t.slice(1, -1);
            const [text, url] = slicedT.split('](');
            return {tag: 'a', href: url, target: '_blank', children: text}
        }},
        {split: /(\*[^\*]+?\*)/g, into: (t) => ({tag: 'i', children: t.slice(1, -1)})}
    ]

    paragraphs.forEach(p => {
        if (!p.tag) return;
        for (let i = p.children.length - 1; i >= 0; i -= 2) {
            const pChild = p.children[i];
            delimeters.forEach(d => {
                const splitPChild = pChild.split(d.split);
                if (splitPChild.length === 1) return;
                p.children.splice(i, 1, ...splitPChild.map((t, i) => i % 2 ? d.into(t) : t));
            })
        }
    });

    // group LI
    let currentUl = null;
    for (let i = paragraphs.length - 1; i >= 0; i--) {
        const p = paragraphs[i];
        if (p.tag === 'li') {
            if (currentUl === null)
                currentUl = {tag: 'ul', children: [p]};
            else
                currentUl.children.unshift(p);
        } else {
            if (currentUl) {
                paragraphs.splice(i + 1, currentUl.children.length, currentUl);
                currentUl = null;
            }
        }
    }
    return paragraphs;
}

function Article(article) {
    return {title: article.title, route: async () => {
        const response = await fetch(article.mdPath);
        if (!response.ok) return {};
        const text = await response.text();
        return {
            tag: 'article',
            id: 'article',
            children: Markdown(text, article)
        }
    }};
}

export const Body = {
    tag: 'body',
    children: [
        Sidebar,
        Router(new Proxy({}, {
            get(o, p, r) {
                if (p === '/' || p === '') return Article(ARTICLES[0]);
                const delimeterIndex = p.indexOf('-');
                const section = p.slice(0, delimeterIndex), article = p.slice(delimeterIndex + 1);
                return Article(ARTICLES.find(a => a.url === article && a.section === section));
            }
        }))
    ]
}