# Getting started with FRUIT Router

There are three ways to add FRUIT Router to a project:

- With NPM installed, run `{shell}npm install @fruit-ui/router`. Then use `import * as router from "@fruit-ui/core"`.
- Access via browser loading, i.e., `import * as fruit from "https://cdn.jsdelivr.net/npm/@fruit-ui/router@latest/src/router.js"`.
- Download and copy the [Terser-compressed JS file](https://github.com/asantagata/fruit-ui/blob/main/router/dist/router.js) file into your project. (This is a compressed version built with Terser; you can just as well use the [non-compressed version](https://github.com/asantagata/fruit-ui/blob/main/router/src/router.js) which uses JSDoc annotations.) Then you can use `import * as router from "./modules/router.js"` or `<script type="module" src="./modules/router.js">` to access FRUIT Router in your JS apps.

You can then access `router.Router()`, `router.getPage()` and `router.navigate()` in your code.