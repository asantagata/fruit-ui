# FRUIT Router

FRUIT Router is a basic router component for FRUIT. It uses search params (i.e., `[[pink]]?page=about`) for routes, which minimizes server-side requirements.

This router provides four significant pieces:

## The `Router()` component

This is a component producer which takes in three props. 
- `routes` is a `Record<string, Route>` where the `string` is the associated path. A `Route` is an object with a `route` method, which generates the template or component for that route, and is allowed to be asynchronous. `routes` can also have a "wildcard" (*) path whose `route` method can take in the current path as an argument. Each `Route` can also have an attribute `title` which will set the window's title for that path.
- `scrollOptions` is an optional prop. It is an object describing how scrolling should be handled when the `Router()` component rerenders. It has two attributes: `hashed` and `unhashed`. These respectively describe how scrolling should be handled given hashed (`[[pink]]?page=about#contact`) and unhashed (`[[pink]]?page=about`) paths. In each of these, you may select any options from the [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) method, as well as an option `to: {x: number, y: number}`, which can take coordinates (in which case `scrollTo` will be used rather than `scrollIntoView`). Either can also be `false` in which case no scrolling will occur. The default value is `{hashed: {}, unhashed: {to: {x: 0, y: 0}}}`.
- `asyncLoader` is an optional `Template` prop describing what should be displayed while an asynchronous route is loading. This is only used on the first path visited in a session; on subsequent paths, the router does not rerender until the new async `route` has fully loaded. The default value is `{}` (an empty `div`).

Here is an example `Router()` (whose `scrollOptions` match those used on these docs):

```js
import * as router from "@fruit-ui/router";

const myRouter = router.Router(
    {
        '': () => HomePage,
        'about': () => AboutPage,
        'contact': () => ContactPage,
        '*': (path) => ({
            children: [
                {tag: 'h2', children: '404'}, 
                {tag: 'p', children: `The page "${path}" does not exist.`}
            ]
        })
    }, {
        hashed: {behavior: 'smooth'}, 
        unhashed: {behavior: 'smooth', to: {x: 0, y: 0}}
    }
);
```

## The `navigate()` function

The `navigate()` function takes in a path and navigates to it. Navigation is done with `history.pushState` so it is compatible with the browser forward/back methods. You can navigate to hashed paths (i.e., `navigate('/about#contact')`) to automatically scroll to a certain element ID, depending on scroll settings.

### The `navigateHash()` function

The `navigateHash()` function navigates to a different hash on the same page, i.e., `navigate('#contact')`. This is done with `history.pushState` so it is compatible with the browser forward/back methods. If the given and existing hashes are the same, the `hashchange` event is still dispatched (see below).

## The `pagechange` event

Elements with `data-receive-page-changes` enabled will receive the `pagechange` event which can be listened for like any other event. This event is broadcast when the `navigate` function is called or forward/back methods are used in the browser. (It is *not*, however, broadcast on page load.) Within the listener, the new path can be accessed using `event.detail.page`.

This attribute can be given using `dataset: {receivePageChanges: true}`.

### The `hashchange` event

Similarly, elements can have `data-receive-hash-changes` (i.e., `dataset: {receiveHashChanges: true}`) to receive the `hashchange` event, on which `event.detail.hash` can be accessed as the new hash. (This is not an instance of the canonical [HashChangeEvent](https://developer.mozilla.org/en-US/docs/Web/API/HashChangeEvent), which `navigateHash` and `navigate` do not fire.)

Note that if the browser back/forward buttons are used, the `pagechange` event will be fired even if only the hash was changed.

## The `getPage()` function
This returns the current path. Note that hashes and opening slashes are automatically removed, so after `navigate('/about#contact')`, a `getPage()` call will return `'about'`.

### The `getHash()` function

This returns the current hash. Note that opening hashes are automatically removed.