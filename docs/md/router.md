# FRUIT Router

This is a basic router component for [FRUIT](https://www.npmjs.com/package/@fruit-ui/core). It uses search params for routes, which minimizes server-side requirements.

This router provides four significant pieces:

## The Router component

This is a component producer which takes in three props. 
- `routes` is an object mapping from paths (strings) to `Route`s. `Route`s are objects with a `route` method (which generates the template/component for that route, and is allowed to be asynchronous.) You can also have a 'wildcard' (*) route whose `route` method can take in the name of the current route as a prop. Each `Route` can also have an attribute `title` which will set the window's title for that path.
- `scrollOptions` is an optional prop. It is an object describing how scrolling should be handled when the Router component rerenders. It has two attributes: `hashed` and `unhashed`. These respectively describe how scrolling should be handled given hashed (`?page=about#contact`) and unhashed (`?page=about`) paths. In each of these, you may select any options from the [scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) method, as well as an option `to: {x: number, y: number}`, which can take coordinates (in which case `scrollTo` will be used rather than `scrollIntoView`). Either can also be `false` in which case no scrolling will occur. The default value is `{hashed: {}, unhashed: {to: {x: 0, y: 0}}}`.
- `asyncLoader` is an optional prop describing what should be displayed while an asynchronous route is loading. This is only used on the first route visited in a session; in subsequent routes, the router displays the old route until the new async route has fully loaded. The default value is `{}` (an empty `div`).

Here is an example router:

```js
import * as router from "@fruit-ui/router";

const router = router.Router(
    {
        '': () => HomePage,
        'about': () => AboutPage,
        'contact': () => ContactPage,
        '*': (page) => ({
            children: [
                {tag: 'h2', children: '404'}, 
                {tag: 'p', children: `The page "${page}" does not exist.`}
            ]
        })
    }, {
        hashed: {behavior: 'smooth'}, 
        unhashed: {behavior: 'smooth', to: {x: 0, y: 0}}
    }
);
```

## The `navigate` function

The `navigate` function takes in a path and navigates to that path. Navigation is done with `history.pushState` so it is compatible with the browser forward/back methods. You can navigate to hashed paths (i.e., `navigate('/about#contact')`) to automatically scroll to a certain element ID, depending on scroll settings.

## The `pagechange` event

Elements with `data-receive-page-changes` enabled will receive the `pagechange` event which can be listened for like any other event. This event is broadcast when the `navigate` function is called or forward/back methods are used in the browser. (It is *not*, however, broadcast on page load.) Within the listener, the new route can be accessed using `event.detail.page`.

This attribute can be given using `dataset: {receivePageChanges: true}`.

## The `getPage` function
This returns the current path. Note that hashes and opening slashes are automatically removed, so after `navigate('/about#contact')`, a `getPage()` call will return `'about'`.