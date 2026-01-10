# Getting started

Setting up FRUIT is quick and easy. You do not need to make a new project to use FRUIT; you can easily integrate it alongside existing web projects. FRUIT makes it easy to embellish static HTML pages with stateful, reactive functionality.

There are three ways to add FRUIT to a project:

- With NPM installed, run `{shell}npm install @fruit-ui/core`. Then use `import * as fruit from "@fruit-ui/core"`.
- Access via browser loading, i.e., `import * as fruit from "https://cdn.jsdelivr.net/npm/@fruit-ui/core@latest/src/index.js"`.
- Download and copy the [Terser-compressed JS file](https://github.com/asantagata/fruit-ui/blob/main/core/dist/index.js) file into your project. (This is a compressed version built with Terser; you can just as well use the [non-compressed version](https://github.com/asantagata/fruit-ui/blob/main/core/src/index.js) which uses JSDoc annotations.) Then you can use `import * as fruit from "./modules/fruit.js"` or `<script type="module" src="./modules/fruit.js">` to access FRUIT in your JS apps.

In order to use FRUIT as an imported package, you may need to locally serve the page using `{shell}npx serve .` or `{shell}npx vite .` in your project directory.

## FRUIT template repo

You can also clone the [FRUIT template repo](https://github.com/asantagata/fruit-ui-template), which contains further instructions for setting up a FRUIT project from scratch.