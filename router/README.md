## FRUIT Router

This is a basic router component for [FRUIT](https://www.npmjs.com/package/@fruit-ui/core). It uses search params for routes, which minimizes server-side requirements. Its basic principles can be extended to RegExp-matched routes and could be applied to create a path-based router.

This router provides four components:
- the Router component. This takes in `routes`, an object mapping from paths (strings) to Routes, objects with a `route` method to generate the appropriate Template, Component etc. It also allows one 'wildcard' (*) route, whose function can take in the name of the route as a parameter. The Route can also have a `title`, which will set the window's title for that route.
- the `navigate` function, which takes in a path and navigates to that path. Navigation is done with `history.pushState` so it is compatible with the browser forward/back methods.
- the `pagechange` event. Elements with `data-receive-page-changes` enabled will receive the `pagechange` event which can be listened for like any other event. This event is broadcast when the `navigate` function is called or forward/back methods are used in the browser. (It is *not*, however, broadcast on page load.) Within the listener, the new route can be accessed using `event.detail.page`.
- the `getPage` function, which returns the current path.

More thorough documentation for FRUIT Router will be available shortly [here](https://asantagata.github.io/fruit-ui/?page=router-index).