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
 * Get the correct item for a page.
 * @param {Object.<string, *>} routes - the collection of items.
 * @param {string} page - the page to index the routes.
 * @param {boolean} isFunctional - whether the expected result is a function.
 * @returns {*} the corresponding item.
 */
function getPageItem(routes, page, isFunctional) {
    if (routes[page]) return routes[page];
    if (routes[`/${page}`]) return routes[`/${page}`];
    if (routes['*']) return routes['*'];
    if (routes['/*']) return routes['/*'];
    return isFunctional ? () => undefined : '';
}

/**
 * A basic router component.
 * @param {Object.<string, () => object>} routes - the collection of routes.
 * @param {Object.<string, string>} [titles] - the collection of titles.
 * @returns {object} a component.
 */
function Router(routes, titles) {
    return {
        render() {
            const page = getPage();
            const route = getPageItem(routes, page)();
            return {
                children: typeof route === 'object' ? {...route, key: page} : route,
                id: 'router',
                dataset: { receivePageChanges: true },
                on: {
                    pagechange() {
                        this.rerender();
                        if (titles) {
                            const title = getPageItem(titles, getPage());
                            if (title)
                                document.title = title;
                        }
                    },
                    mount() {
                        window.onpopstate = () => broadcastPageChange(getPage());
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