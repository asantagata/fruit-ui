const PARAM_NAME = 'page'

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
 * A basic router component.
 * @param {Object.<string, () => {route: object, title?: string}>} routes - the collection of routes.
 * @returns {object} a component.
 */
function Router(routes) {
    return {
        render() {
            const page = getPage();
            const route = getRoute(routes, page);
            const element = route.route(page);
            return {
                children: typeof element === 'object' ? {...element, key: page} : element,
                id: 'router',
                dataset: { receivePageChanges: true },
                on: {
                    pagechange() {
                        this.rerender();
                        document.title = getRoute(routes, getPage()).title ?? document.title;
                    },
                    mount() {
                        window.onpopstate = () => broadcastPageChange(getPage());
                        document.title = route.title ?? document.title;
                    }
                }
            }
        }
    }
}

/**
 * Navigates to a page.
 * @param {string} page - the page.
 */
function navigate(page) {
    if (page.startsWith('/')) page = page.slice(1);
    if (page === getPage()) return;
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM_NAME, page);
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

export { navigate, Router, getPage }