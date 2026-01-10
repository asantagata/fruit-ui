const PARAM_NAME = 'page';

/**
 * Get the current page.
 * @returns {string}
 */
function getPage() {
    const params = new URLSearchParams(window.location.search);
    return params.get(PARAM_NAME) ?? '';
}

/**
 * Get the correct route for a page.
 * @param {Object.<string, *>} routes - the collection of routes.
 * @param {string} page - the page name to index the routes.
 * @returns {object} the corresponding route.
 */
function getRoute(routes, page) {
    if (routes[page]) return routes[page];
    if (routes[`/${page}`]) return routes[`/${page}`];
    if (routes['*']) return routes['*'];
    if (routes['/*']) return routes['/*'];
    return {};
}

/**
 * Custom addon to scrollIntoView with coords handling.
 * @param {HTMLElement} target 
 * @param {object} scrollOptions 
 */
function scrollIntoView(target, scrollOptions) {
    if (scrollOptions.to) {
        target.scrollTo({...scrollOptions, top: scrollOptions.to.y, left: scrollOptions.to.x});
    } else {
        target.scrollIntoView(scrollOptions);
    }
}

/**
 * Handles scrolling.
 * @param {HTMLElement} element - Router element
 * @param {object | false} scrollOptions - Scroll options
 */
function handleScrolling(element, scrollOptions) {
    if (window.location.hash && document.getElementById(window.location.hash.slice(1))) {
        if (scrollOptions.hashed)
            scrollIntoView(document.getElementById(window.location.hash.slice(1)), scrollOptions.hashed);
    } else {
        if (scrollOptions.unhashed)
            scrollIntoView(element, scrollOptions.unhashed);
    }
}

/**
 * A basic router component.
 * @param {Object.<string, {route: () => object, title?: string}>} routes - the collection of routes.
 * @param {object | false} [scrollOptions] - scrolling options.
 * @param {object} [asyncLoader] - loader to use while processing initial async resources
 * @returns {object} a component.
 */
function Router(routes, scrollOptions = {hashed: {}, unhashed: {to: {x: 0, y: 0}}}, asyncLoader = {}) {
    return {
        state() {
            const page = getPage();
            const route = getRoute(routes, page);
            return {
                element: (() => {
                    if (Object.getPrototypeOf(route.route).constructor.name === "AsyncFunction") {
                        route.route(page).then(v => {
                            document.getElementById('router').dispatchEvent(new CustomEvent('initrouterload', {detail: {element: v}}));
                        });
                        return asyncLoader;
                    } else {
                        return route.route(page);
                    }
                })()
            }
        },
        render() {
            return {
                children: typeof this.state.element === 'object' ? 
                    {...this.state.element, key: `route-${getPage()}`} : this.state.element,
                id: 'router',
                dataset: { receivePageChanges: true, receiveHashChanges: true },
                on: {
                    pagechange() {
                        const page = getPage();
                        const route = getRoute(routes, page);
                        if (Object.getPrototypeOf(route.route).constructor.name === "AsyncFunction") {
                            route.route(page).then(v => {
                                this.state.element = v;
                                this.rerender();
                                handleScrolling(this.element, scrollOptions);
                            });
                        } else {
                            this.state.element = route.route(page);
                            this.rerender();
                            handleScrolling(this.element, scrollOptions);
                        }
                        document.title = getRoute(routes, getPage()).title ?? document.title;
                    },
                    hashchange() {
                        handleScrolling(this.element, scrollOptions);
                    },
                    mount() {
                        document.title = getRoute(routes, getPage()).title ?? document.title;
                        window.onpopstate = () => broadcastPageChange(getPage());
                        const page = getPage();
                        const route = getRoute(routes, page);
                        if (Object.getPrototypeOf(route.route).constructor.name !== "AsyncFunction")
                            handleScrolling(this.element, scrollOptions);
                    },
                    initrouterload(e) {
                        this.state.element = e.detail.element;
                        this.rerender();
                        handleScrolling(this.element, scrollOptions);
                    }
                }
            }
        },
        memo() {return getPage()}
    }
}

/**
 * Navigates to a page.
 * @param {string} page - the page.
 */
function navigate(page) {
    if (page.startsWith('/')) page = page.slice(1);
    let hash = '';
    if (page.includes('#')) {
        hash = page.slice(page.indexOf('#'));
        page = page.slice(0, page.indexOf('#'));
    }
    if (page === getPage()) return;
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM_NAME, page);
    url.hash = hash;
    window.history.pushState({}, '', url);
    broadcastPageChange(page);
}

/**
 * Broadcasts that a page updated.
 * @param {string} page - the page. 
 */
function broadcastPageChange(page) {
    const event = new CustomEvent('pagechange', {detail: {page}});
    Array.from(document.querySelectorAll(`[data-receive-page-changes]`)).forEach(target => {
        target.dispatchEvent(event);
    });
}

/**
 * Navigates to a hash.
 * @param {string} hash - the hash.
 */
function navigateHash(hash) {
    hash = hash.slice(hash.indexOf('#') + 1);
    const url = new URL(window.location.href);
    url.hash = hash;
    if (hash !== getHash())
        window.history.pushState({}, '', url);
    broadcastHashChange(hash);
}

/**
 * Get the current hash.
 * @returns {string}
 */
function getHash() {
    return window.location.hash.slice(1);
}

/**
 * Broadcasts that a hash updated.
 * @param {string} hash - the hash. 
 */
function broadcastHashChange(hash) {
    const event = new CustomEvent('hashchange', {detail: {hash}});
    Array.from(document.querySelectorAll(`[data-receive-hash-changes]`)).forEach(target => {
        target.dispatchEvent(event);
    });
}

export { navigate, Router, getPage, navigateHash, getHash };