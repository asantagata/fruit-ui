import { Router, navigate, navigateHash, getPage } from "https://cdn.jsdelivr.net/npm/@fruit-ui/router@latest/src/router.js";
import { examples } from "./examples.js";

const ARTICLES = [
    {title: 'FRUIT', url: 'index', section: 'core', 
        results: {
            fun: examples['core-fun'],
            counter: examples['core-counter']
        }
    },
    {title: 'Getting started', url: 'getting-started', section: 'core'},
    {title: 'Templates', url: 'templates', section: 'core',
        results: {
            demo: examples['templates-demo'],
            on: examples['templates-on'],
            props: examples['templates-props']
        }
    },
    {title: 'Components', url: 'components', section: 'core', 
        results: {
            counter: examples['core-counter'],
            memo: examples['components-memo']
        }
    },
    {title: 'Superpowered `this`', url: 'this', section: 'core'},
    {title: 'Keys', url: 'keys', section: 'core',
        results: {
            counter: examples['keys-resetable-counter'],
            without: examples['keys-reorder'](false),
            with: examples['keys-reorder'](true),
        }
    },
    {title: 'Bindings', url: 'bindings', section: 'core', 
        results: {
            example: examples['bindings-example']
        }
    },
    {title: 'Putting FRUIT on the DOM', url: 'putting-on-dom', section: 'core', results: {
        counter: examples['core-counter'],
    }},

    {title: 'FRUIT Router', url: 'index', section: 'router'},
    {title: 'Getting started with FRUIT Router', url: 'getting-started', section: 'router'}
];

const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`;

function getArticleRoute(article) {
    return `${article.section}-${article.url}`;
}

const Sidebar = {
    render() {
        const page = getPage();
        return {
            id: 'sidebar',
            dataset: {receivePageChanges: true},
            on: {pagechange() {this.rerender()}},
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
                            innerHTML: CHEVRON_RIGHT
                        },
                        {
                            id: 'logo-wrapper',
                            children: [{
                                tag: 'img',
                                src: './assets/logo.svg',
                                id: 'logo'
                            }, ' FRUIT'],
                            on: {click() {navigate('core-index')}}
                        }
                    ]
                },
                {
                    id: 'sidebar-index',
                    children: Object.entries(Object.groupBy(ARTICLES, a => a.section)).flatMap(([sectionName, entries]) => ([
                            {class: 'section-name', children: sectionName.toUpperCase()},
                            ...entries.map(entry => {
                                const fullRouteName = getArticleRoute(entry);
                                return {
                                    class: {
                                        'index-entry': true,
                                        'selected': fullRouteName === page || (fullRouteName === 'core-index' && page === '')
                                    },
                                    children: {...Markdown(entry.title)[0], tag: 'span'},
                                    on: {click() {
                                        navigate(fullRouteName);
                                        document.getElementById('chevron-input').checked = false;
                                    }}
                                };
                            })
                        ]
                    ))
                }
            ]
        }
    }
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
    const declareKeywords = new Set(['const', 'function', 'let', 'new', 'document', 'type']);
    const ctrlflowKeywords = new Set(['break', 'do', 'while', 'for', 'in', 'of', 'if', 'else', 'return', 'import', 'from', 'as', 'string', 'boolean', 'null', 'any', 'void', 'true', 'false']);
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
        else if (currentType !== TokenTypes.COMMENT && token.type === TokenTypes.QUOTE && token.text.length === 1) {
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

        if (i > 1 && token.type === TokenTypes.NUMBER && tokens[i - 1].type === TokenTypes.SYMBOLIC && tokens[i - 2].type === TokenTypes.NUMBER && tokens[i - 1].text === '.')
            tokens[i - 1].type = TokenTypes.NUMBER;
        if (i > 1 && token.type === TokenTypes.ALPHANUMERIC && tokens[i - 1].type === TokenTypes.SYMBOLIC && tokens[i - 2].type === TokenTypes.ALPHANUMERIC && tokens[i - 1].text === '-')
            tokens[i - 1].type = TokenTypes.ALPHANUMERIC;
    }

    return {
        tag: 'code',
        class: `${mode}-code`,
        children: tokens.map(({text, type}) => ({tag: 'span', class: `token ${type === TokenTypes.CURLY ? TokenTypes.SYMBOLIC : type}`, children: text}))
    };
}

function TreeSyntaxHighlighting(code) {
    const colors = {
        pink: TokenTypes.CTRLFLOW_KEYWORD,
        orange: 'blue',
        yellow: TokenTypes.SYMBOLIC,
        green: 'green',
        blue: 'orange',
        pale: TokenTypes.OBJECT,
    }
    
    const lines = code.split('\n').map(l => [...l.matchAll(/([├─│└ ]*)(\w+)\/([\w\+]+);(\w+)/g)]).flatMap(([match]) => {
        const [_,branch,name,branchColor,nameColor] = match;
        if (branchColor.indexOf('+') > 0) {
            const [branch1, branch2] = branch.split('   ');
            const [branch1Color, branch2Color] = branchColor.split('+');
            return [
                {tag: 'span', class: `token ${colors[branch1Color]}`, children: branch1},
                {tag: 'span', class: `token ${colors[branch2Color]}`, children: `   ${branch2}`},
                {tag: 'span', class: `token ${colors[nameColor]}`, children: `${name}\n`},
            ]
        }
        return [
            {tag: 'span', class: `token ${colors[branchColor]}`, children: branch},
            {tag: 'span', class: `token ${colors[nameColor]}`, children: `${name}\n`},
        ]
    });

    return {
        tag: 'code',
        class: `dark-code`,
        children: lines
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
            };
        }
        case 'tree': return TreeSyntaxHighlighting(code);
        case 'js': return JSSyntaxHighlighting(code, mode);
    }
}

function idify(str) {
    return str.toLowerCase().replace(/[^\w -]/g, '').replace(/ /g, '-');
}

function Markdown(text, article) {
    const lines = text.split('\n');

    // recognize codeblocks
    let currentCodeblock = null;
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (currentCodeblock !== null) {
            if (line.startsWith('```')) {
                const code = currentCodeblock.join('\n');
                if (line.startsWith('```{')) {
                    const tag = line.trim().slice(4, -1);
                    lines.splice(i, currentCodeblock.length + 2, {
                        class: 'example',
                        children: [
                            {
                                tag: 'pre',
                                children: SyntaxHighlighting(code)
                            },
                            {class: 'resultbox', children: article.results[tag]}
                        ]
                    });
                } else if (line.startsWith('```[')) {
                    const lang = line.trim().slice(4, -1);
                    lines.splice(i, currentCodeblock.length + 2, {
                        tag: 'pre',
                        children: SyntaxHighlighting(code, 'dark', lang)
                    })
                } else {
                    lines.splice(i, currentCodeblock.length + 2, {
                        tag: 'pre',
                        children: SyntaxHighlighting(code)
                    });
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
    const paragraphs = lines.filter(t => t.children || t.trim().length > 0).map(text => {
        if (text.children) return text;
        if (text.startsWith('# ')) return {tag: 'h1', id: idify(text.slice(2)), children: [text.slice(2)]}
        if (text.startsWith('## ')) return {tag: 'h2', id: idify(text.slice(3)), children: [text.slice(3)]}
        if (text.startsWith('### ')) return {tag: 'h3', id: idify(text.slice(4)), children: [text.slice(4)]}
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
            } else if (/^\[\[\w+\]\]/.test(slicedT)) {
                const closingBracketsIndex = slicedT.indexOf(']]');
                const lang = slicedT.slice(2, closingBracketsIndex); 
                const code = slicedT.slice(closingBracketsIndex + 2);
                return {tag: 'code', class: 'light-code', children: {tag: 'span', class: `token ${lang}`, children: code}};
            }
            return SyntaxHighlighting(slicedT, 'light');
        }},
        {split: /(@\[[^\]]+?\]\([^\)]+?\))/g, into: (t) => {
            const slicedT = t.slice(2, -1);
            const [text, url] = slicedT.split('](');
            return {tag: 'span', class: 'a', on: {click() {navigate(url)}}, children: text}
        }},
        {split: /(#\[[^\]]+?\]\([^\)]+?\))/g, into: (t) => {
            const slicedT = t.slice(2, -1);
            const [text, hash] = slicedT.split('](');
            return {tag: 'span', class: 'a', on: {click() {navigateHash(hash)}}, children: text}
        }},
        {split: /(\[[^\]]+?\]\([^\)]+?\))/g, into: (t) => {
            const slicedT = t.slice(1, -1);
            const [text, url] = slicedT.split('](');
            return {tag: 'a', href: url, target: '_blank', children: text}
        }},
        {split: /(\*[^\*]+?\*)/g, into: (t) => ({tag: 'i', children: t.slice(1, -1)})}
    ]

    for (let pi = 0; pi < paragraphs.length; pi++) {
        const p = paragraphs[pi];
        if (!p.tag) continue;
        for (let di = 0; di < delimeters.length; di++) {
            const d = delimeters[di];
            for (let i = p.children.length - 1; i >= 0; i -= 2) {
                const pChild = p.children[i];
                const splitPChild = pChild.split(d.split);
                if (splitPChild.length === 1) continue;
                p.children.splice(i, 1, ...splitPChild.map((t, i) => i % 2 ? d.into(t) : t));
            }
        }
    }

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

function Next(article) {
    const index = ARTICLES.indexOf(article);
    const next = ARTICLES[index + 1];
    if (!next) return {};
    else return {
        id: 'next-button',
        children: {
            children: [
                {children: [
                    {tag: 'p', children: 'NEXT UP'},
                    {tag: 'h3', children: {...Markdown(next.title)[0], tag: 'span'}},
                    {tag: 'p', children: `FRUIT/${next.section.toUpperCase()}`},
                ]},
                {innerHTML: CHEVRON_RIGHT}
            ],
            on: {click() {
                navigate(getArticleRoute(next))
            }}
        },
    }
}

function Article(article) {
    return {title: `${article.title} | FRUIT Docs`, route: async () => {
        const response = await fetch(`./md/${article.section}/${article.url}.md`);
        if (!response.ok) return {};
        const text = await response.text();
        return {
            tag: 'article',
            id: 'article',
            children: [...Markdown(text, article), Next(article)]
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
        }), {hashed: {behavior: 'smooth'}, unhashed: {behavior: 'smooth', to: {x: 0, y: 0}}})
    ]
}