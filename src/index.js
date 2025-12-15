/**
 * Non-string properties of Templates.
 * @typedef {object} TemplateSpecialProperties
 * @property {string | string[] | Object.<string, any>} [class] - The element's class.
 * @property {CSSStyleDeclaration} [style] - The element's style.
 * @property {Object.<string, Function>} [on] - The element's listeners (and onmount function.) 
 *  Within these, `this` refers to the nearest component's This (if applicable) 
 *  and `this.element` refers to the element.
 * @property {Elementable | Elementable[]} [children] - The element's children.
 * @property {Element} [cloneFrom] - The element to deep-clone from for this element. 
 *  This overrides all other properties.
 * @property {Object.<string, string>} [dataset] - The element's dataset.
 * @property {string} [key] - The element's key, used to distinguish re-ordered 
 *  siblings and preserve state.
 */

/**
 * A JavaScript object describing a non-reactive HTML element.
 *  All element properties not explicitly listed (e.g., href, src, title, etc.)
 *  can also be written here.
 * @typedef {Object.<string, string> & TemplateSpecialProperties} Template
 */

/**
 * A function which produces a Template using a This.
 * @typedef {(this: This) => Template} TemplateProducer
 */

/**
 * A function which produces a Template with an exposed This.
 * @typedef {() => Template} BoundTemplateProducer
 * @property {This} this - The bounded This.
 * @property {ComponentID} componentId - The corresponding ComponentId.
 */

/**
 * Any representation of an Element.
 * Primitives (number, boolean) are stringified automatically.
 * @typedef {Component | Template | string | number | boolean} Elementable
 */

/**
 * An auxiliary This argument for component TemplateProducers and listeners.
 * Note listeners also have the property `.target` describing that element.
 * @typedef {object} This
 * @property {HTMLElement} [element] - The component, post-mount.
 * @property {() => void} [rerender] - The rerender function, post-mount.
 * @property {BoundTemplateProducer} [producer] - The producer function, post-mount.
 * @property {object} state - The component's state.
 * @property {object} setState - Functions to set the component's state with automatic reactivity.
 * @property {Object.<string, Binding>} bindings - The component's bindings.
 */

/**
 * A child, grandchild etc. to a Component.
 * @typedef {object} Binding
 * @property {HTMLElement} element - The bounded element.
 * @property {() => void} rerender - The bounded element's rerender function.
 */

/**
 * A component, which can be rerendered reactively.
 * @typedef {object} Component
 * @property {TemplateProducer} render - The main render function.
 * @property {() => Object.<string, any>} [state] - The initializer for local state.
 * @property {string} [key] - The element's key, used to distinguish re-ordered siblings and preserve state.
 */

/**
 * A function which takes in props and produces a Component.
 * @typedef {(...args: any) => Component} ComponentProducer
 */

/**
 * A component's ID.
 * @typedef {string} ComponentID
 */

/** @type {number} */
let globalComponentCount = 0;

/** @type {Object.<ComponentID, This>} */
const thisRecord = {};

/** @type {Set<ComponentID>} */
const rerenderQueue = new Set();

/**
 * Rerender the elements in the rerenderQueue.
 */
function rerenderEnqueuedComponents() {
    Array.from(rerenderQueue).forEach(cId => thisRecord[cId]?.rerender());
    rerenderQueue.clear();
}

/**
 * Enqueue a component for rerender.
 * @param {ComponentID} componentId - the componentId. 
 */
function enqueueToRerender(componentId) {
    const enqueueRerenderTask = rerenderQueue.size === 0;
    rerenderQueue.add(componentId);
    if (enqueueRerenderTask)
        queueMicrotask(rerenderEnqueuedComponents);
}

/**
 * Create a new This.
 * @returns {This} the new This.
 */
function createThis() {
    return {
        state: {},
        setState: {},
        bindings: {}
    };
}

/**
 * Initialize an empty This.
 * @param {This} this - the This.
 * @param {HTMLElement} element - the HTMLElement to use as this.element.
 * @param {BoundTemplateProducer} producer - the producer function for rerendering.
 */
function initializeThis(element, producer) {
    this.element = element;
    this.producer = producer;
    this.rerender = rerender.bind(this);
    this.setState = new Proxy({}, {
        get: (o, p, r) => {
            return (x) => {
                this.state[p] = x;
                enqueueToRerender(producer.componentId);
            }
        }
    });
}

/**
 * Creates an HTMLElement from a Template.
 * @param {This | undefined} this - the nearest Component's This, if applicable. 
 * @param {Template} template - the Template.
 * @param {Function[]} onMounts - the aggregated onMounts. 
 * @param {BoundTemplateProducer} [producer] - the nearest Component's producer.
 * @returns {HTMLElement} - An HTMLElement.
 */
function createElementFromTemplate(template, onMounts, producer = null) {
    if (template.cloneFrom) {
        const element = template.cloneFrom.cloneNode(true);
        if (this && !this.element) {
            initializeThis.call(this, element, producer);
        }
        return element;
    }
    const {tag, class: c, style, on, componentId, children, cloneFrom, dataset, key, binding, ...rest} = template;
    const element = document.createElement(template.tag || 'div');
    if (template.class) {
        switch (typeof template.class) {
            case 'string':
                element.className = template.class;
                break;
            case 'object':
                if (Array.isArray(template)) {
                    element.className = template.class.join(" ");
                } else {
                    element.className = Object.keys(template.class)
                        .filter(c => template.class[c]).join(" ");
                }
        }
    }
    if (template.style) {
        for (const k in template.style) {
            element.style[k] = template.style[k];
        }
    }
    if (template.on) {
        const {mount: onMount, ...listeners} = template.on;
        for (const type in listeners) {
            if (!listeners[type]) continue;
            element.addEventListener(type, (event) => listeners[type].call({...(this ?? {}), target: element}, event));
        }
        if (onMount) {
            onMounts.push(() => onMount.call({...(this ?? {}), target: element}));
        }
    }
    for (const attribute in rest) {
        if (!template[attribute]) continue;
        element.setAttribute(attribute, template[attribute]);
    }
    if (template.dataset) {
        for (const k in template.dataset) {
            element.dataset[k] = template.dataset[k];
        }
    }
    if (template.componentId) {
        element.dataset.componentId = template.componentId;
    }
    if (template.key) {
        element.dataset.key = template.key;
    }
    if (template.binding) {
        element.dataset.binding = template.binding;
    }
    if (this && !this.element) {
        initializeThis.call(this, element, producer);
    }
    if (template.innerHTML) {
        element.innerHTML = template.innerHTML;
    } else if ('children' in template) {
        if (Array.isArray(template.children)) {
            element.replaceChildren(
                ...template.children.map(ct => createElementFromElementable.call(this, ct, onMounts))
            );
            // handle bindings
            for (let i = 0; i < template.children.length; i++) {
                const childTm = template.children[i];
                if (childTm.binding && this) {
                    setBinding.call(this, childTm.binding, element.childNodes[i]);
                }
            }
        } else {
            element.replaceChildren(createElementFromElementable.call(this, template.children, onMounts));
            // handle binding
            if (template.children.binding && this) {
                setBinding.call(this, template.children.binding, element.childNodes[0]);
            }
        }
    }
    return element;
}

/**
 * Binds a TemplateProducer to a new This.
 * @param {TemplateProducer} producer - the TemplateProducer.
 * @returns {BoundTemplateProducer} - the BoundTemplateProducer.
 */
function bindTemplateProducer(producer) {
    const newThis = createThis();
    const boundProducer = producer.bind(newThis);
    boundProducer.this = newThis;
    boundProducer.componentId = `component-${globalComponentCount++}`;
    return boundProducer;
}

/**
 * Determines whether an Elementable is a Component.
 * @param {Elementable} elementable - the Elementable.
 * @returns {boolean} - whether it is a Component.
 */
function elementableIsComponent(elementable) {
    return !!elementable.render;
}

/**
 * Creates an HTMLElement or string from any Elementable.
 * @param {This} this - the nearest Component's This. 
 * @param {Elementable} elementable - the Elementable.
 * @param {Function[]} onMounts - the aggregated onMounts.
 * @returns {HTMLElement | string} - the HTMLElement or string.
 */
function createElementFromElementable(elementable, onMounts) {
    if (typeof elementable === 'object') {
        if (elementableIsComponent(elementable)) {
                return createElementFromComponent(elementable, onMounts);
            } else {
                return createElementFromTemplate.call(this, elementable, onMounts);
            }
    } else {
        return elementable.toString();
    }
}

/**
 * Creates an HTMLElement from a Component.
 * @param {Component} component - the Component.
 * @param {Function[]} onMounts - the aggregated onMounts.
 * @returns {HTMLElement} - An HTMLElement.
 */
function createElementFromComponent(component, onMounts) {
    const boundProducer = bindTemplateProducer(component.render);
    thisRecord[boundProducer.componentId] = boundProducer.this;
    boundProducer.this.state = component.state ? component.state() : {};
    const template = boundProducer();
    return createElementFromTemplate.call(boundProducer.this, giveTemplateComponentMetadata(template, boundProducer.componentId, component.key, component.binding), onMounts, boundProducer);
}

/**
 * Returns a template imbued with component data.
 * @param {Template} template - the Template.
 * @param {ComponentID} componentId - the ComponentId.
 * @param {Key} [key] - the key, if applicable.
 * @param {string} [bindingName] - the name of the binding, if applicable. 
 * @returns {Template} - the imbued Template.
 */
function giveTemplateComponentMetadata(template, componentId, key, bindingName) {
    return {
        ...template,
        componentId,
        key: key ?? template.key,
        binding: bindingName ?? template.binding
    }
}

/**
 * Wrap a function in onMounts handling.
 * @param {(onMounts: Function[]) => void} func - the function.
 */
function doOnMountHandling(func) {
    const onMounts = [];
    func(onMounts);
    onMounts.forEach(om => om());
}

/**
 * Rerenders a component using its This.
 * @param {This} this - the This.
 */
function rerender() {
    doOnMountHandling((onMounts) => {
        const template = this.producer();
        rerenderElementFromTemplate.call(this, this.element, giveTemplateComponentMetadata(template, this.producer.componentId), onMounts);
    });
}

/**
 * Rerenders one of a component's bindings using its This.
 * @param {This} this - the This.
 * @param {string} bindingName - the binding name of the bounded element.
 */
function rerenderByBinding(bindingName) {
    const template = this.producer();
    const subTemplate = findSubtemplate(template, bindingName);
    const subElement = findSubelement(this.element, bindingName);
    if (subTemplate && subElement) {
        doOnMountHandling((onMounts) => {
            if (elementableIsComponent(subTemplate)) {
                if ('componentId' in subElement.dataset) 
                    rerenderChildComponent(subElement, subTemplate, onMounts);
                else subElement.replaceWith(createElementFromComponent(subTemplate, onMounts));
            } else {
                if ('componentId' in subElement.dataset) delete thisRecord[subElement.dataset.componentId];
                rerenderElementFromTemplate.call(this, subElement, subTemplate, onMounts);
            }
        });
    }
}

/**
 * Finds a child with a given binding name. Stops at components.
 * @param {HTMLElement} element - the HTMLElement.
 * @param {string} bindingName - the binding name to search for.
 * @param {boolean} atRoot - whether this is the root. True by default.
 */
function findSubelement(element, bindingName, atRoot = true) {
    if (element.dataset.binding === bindingName && !atRoot) {
        return element;
    } else if (!atRoot && 'componentId' in element.dataset) {
        return undefined;
    }
    return Array.from(element.children).find(c => !!findSubelement(c, bindingName, false));
}

/**
 * Finds a subtree template by a binding name. Stops at components.
 * Excludes the given Template (the root) from the search.
 * @param {Template} template - the Template.
 * @param {string} bindingName - the binding name.
 * @param {boolean} [atRoot] - whether this is the root. True by default.
 * @returns {Template | Component | undefined} the result.
 */
function findSubtemplate(template, bindingName, atRoot = true) {
    if (template.binding === bindingName && !atRoot) {
        return template;
    }
    if (template.children) {
        if (Array.isArray(template.children)) {
            return template.children.find(c => findSubtemplate(c, bindingName, false));
        } else {
            return findSubtemplate(template.children, bindingName, false);
        }
    }
    return undefined;
}

/**
 * Rerenders an HTMLElement from a Template.
 * @param {This} this - the nearest Component's This. 
 * @param {HTMLElement} element - the Element.
 * @param {Template} template - the Template.
 * @param {Function[]} onMounts - the aggregated onMounts. 
 */
function rerenderElementFromTemplate(element, template, onMounts) {
    if (typeof template !== 'object') {
        return element.replaceWith(template.toString());
    }
    if (template.cloneFrom && !element.isEqualNode(template.cloneFrom)) {
        return element.replaceWith(template.cloneFrom.cloneNode(true));
    }
    if ((template.tag?.toUpperCase() || 'DIV') !== element.tagName) {
        // tag cannot be changed
        return element.replaceWith(createElementFromElementable.call(this, template, onMounts));
    }
    if (template.class) {
        if (typeof template.class === 'string') {
            element.className = template.class;
        } else if (Array.isArray(template)) {
            element.className = template.class.join(" ");
        } else {
            for (const key in template.class) {
                if (template.class[key]) {
                    element.classList.add(key);
                } else {
                    element.classList.remove(key);
                }
            }
        }
    }
    if (template.style) {
        for (let key in template.style) {
            element.style[key] = template.style[key];
        }
    }
    if (template.dataset) {
        for (let key in template.dataset) {
            element.dataset[key] = template.dataset[key];
        }
    }
    const {tag, cloneFrom, class: _, style, on, key, dataset, componentId, children, innerHTML, binding, ...rest} = template;
    for (const attribute in rest) {
        element.setAttribute(attribute, template[attribute]);
    }
    if (template.innerHTML) {
        element.innerHTML = template.innerHTML;
    } else if (template.children === undefined || template.children.length === 0) {
        element.innerHTML = "";
    } else {
        rerenderChildren.call(this, element, template, onMounts);
    }
}

/**
 * Rerenders a component HTMLElement from a Component, preserving state but updating the producer.
 * @param {HTMLElement} element - the element.
 * @param {Component} component - the Component.
 * @param {Function[]} onMounts - the aggregated onMounts. 
 */
function rerenderChildComponent(element, component, onMounts) {
    const cmpThis = thisRecord[element.dataset.componentId];
    cmpThis.producer = component.render.bind(cmpThis);
    rerenderElementFromTemplate.call(cmpThis, element, cmpThis.producer(), onMounts);
}

/**
 * Re-creates a keyed child component with a known This (i.e., when changing order).
 * @param {Component} component - the Component's new template.
 * @param {ComponentID} componentId - the Component's old ComponentId. 
 * @param {Function[]} onMounts - the aggregated onMounts.
 * @returns {HTMLElement} the re-created HTMLElement.
 */
function recreateKeyedChildComponent(component, componentId, onMounts) {
    const cmpThis = thisRecord[componentId];
    cmpThis.producer = component.render.bind(cmpThis);
    const template = cmpThis.producer();
    const element = createElementFromTemplate.call(cmpThis, giveTemplateComponentMetadata(template, componentId, component.key, component.binding), onMounts, cmpThis.producer);
    cmpThis.element = element;
    return element;
}

/**
 * Rerender an element's children into a Template.
 * @param {This} this - the nearest Component's This.
 * @param {HTMLElement} element - the Element. 
 * @param {Template} template - the Template.
 * @param {Function[]} onMounts - the aggregated onMounts.
 */
function rerenderChildren(element, template, onMounts) {
    const elChildrenArray = Array.from(element.children);
    const tmChildNodeArray = Array.isArray(template.children) ? template.children : [template.children];
    const tmChildrenArray = tmChildNodeArray.filter(c => typeof c === 'object');

    // element nodes
    if (elChildrenArray.length > 0 && tmChildrenArray.length > 0 && elChildrenArray.every(elChild => 'key' in elChild.dataset) && tmChildrenArray.every(tmChild => 'key' in tmChild)) {

        // be smart with keys in here
        const keyIndexInEl = {};
        for (let i = 0; i < elChildrenArray.length; i++) {
            keyIndexInEl[elChildrenArray[i].dataset.key] = i;
        }

        const keyIndexInTm = {};
        for (let i = 0; i < tmChildrenArray.length; i++) {
            keyIndexInTm[tmChildrenArray[i].key] = i;
        }

        const tmKeyIndexInEl = tmChildrenArray.map(k => keyIndexInEl[k.key] ?? -1);

        const lis = LIS(tmKeyIndexInEl.filter(i => i > -1));

        for (let i = 0; i < lis.length; i++) {
            const elIndex = lis[i];
            const childEl = elChildrenArray[elIndex];
            const childTm = tmChildrenArray[keyIndexInTm[childEl.dataset.key]];

            if (elementableIsComponent(childTm)) {
                if ('componentId' in childEl.dataset) rerenderChildComponent(childEl, childTm, onMounts);
                else childEl.replaceWith(createElementFromComponent(childTm, onMounts));
            } else {
                if ('componentId' in childEl.dataset) delete thisRecord[childEl.dataset.componentId];
                rerenderElementFromTemplate.call(this, childEl, childTm, onMounts);
            }
        }

        const setLis = new Set(lis);
        const movedElKeyToComponentId = {};

        for (let i = elChildrenArray.length - 1; i >= 0; i--) {
            if (!setLis.has(i)) {
                const childEl = elChildrenArray[i];
                if ('componentId' in childEl.dataset) {
                    if (childEl.dataset.key in keyIndexInTm) {
                        movedElKeyToComponentId[childEl.dataset.key] = childEl.dataset.componentId;
                    } else {
                        delete thisRecord[childEl.dataset.componentId];
                    }
                }
                if ('binding' in childEl.dataset) delete this.bindings[childEl.dataset.binding];
                childEl.remove();
            }
        }

        for (let i = 0; i < tmChildrenArray.length; i++) {
            const childTm = tmChildrenArray[i], childEl = element.children[i];
            if (!childEl) {
                const componentId = movedElKeyToComponentId[childTm.key];
                if (componentId) {
                    element.appendChild(recreateKeyedChildComponent(childTm, componentId, onMounts));
                } else {
                    element.appendChild(createElementFromElementable.call(this, childTm, onMounts));
                }
            } else {
                if (childEl.dataset.key !== childTm.key) {
                    const componentId = movedElKeyToComponentId[childTm.key];
                    if (componentId) {
                        element.insertBefore(recreateKeyedChildComponent(childTm, componentId, onMounts), childEl);
                    } else {
                        element.insertBefore(createElementFromElementable.call(this, childTm, onMounts), childEl);
                    }
                }
            }
        }
    } else if (tmChildrenArray.length > 0 && elChildrenArray.length > 0) {
        // handle first Min(M,N) elements
        for (let i = 0; i < Math.min(elChildrenArray.length, tmChildrenArray.length); i++) {
            let childEl = elChildrenArray[i], childTm = tmChildrenArray[i];
            if ('binding' in childEl.dataset && childEl.dataset.binding !== childTm.binding) 
                delete this.bindings[childEl.dataset.binding];
            if (elementableIsComponent(childTm)) {
                if ('componentId' in childEl.dataset) rerenderChildComponent(childEl, childTm, onMounts);
                else childEl.replaceWith(createElementFromComponent(childTm, onMounts));
            } else {
                if ('componentId' in childEl.dataset) delete thisRecord[childEl.dataset.componentId];
                rerenderElementFromTemplate.call(this, childEl, childTm, onMounts);
            }
        }

        // prune at or append to end
        if (elChildrenArray.length < tmChildrenArray.length) {
            for (let i = elChildrenArray.length; i < tmChildrenArray.length; i++) {
                let childTm = tmChildrenArray[i];
                const newChild = createElementFromElementable.call(this, childTm, onMounts);
                element.appendChild(newChild);
            }
        } else if (elChildrenArray.length > tmChildrenArray.length) {
            for (let i = elChildrenArray.length - 1; i >= tmChildrenArray.length; i--) {
                let childEl = elChildrenArray[i];
                if ('componentId' in childEl.dataset) delete thisRecord[childEl.dataset.componentId];
                if ('binding' in childEl.dataset) delete this.bindings[childEl.dataset.binding];
                childEl.remove();
            }
        }
    }

    // handle bindings
    for (let i = 0; i < tmChildrenArray.length; i++) {
        const childTm = tmChildrenArray[i];
        if (childTm.binding) {
            setBinding.call(this, childTm.binding, element.children[i]);
        }
    }

    // handle text nodes
    for (let i = 0; i < tmChildNodeArray.length; i++) {
        if (i >= element.childNodes.length) {
            element.appendChild(document.createTextNode(tmChildNodeArray[i]));
        } else {
            if (element.childNodes[i].nodeType === Node.TEXT_NODE) {
                if (typeof tmChildNodeArray[i] !== 'object') {
                    element.childNodes[i].textContent = tmChildNodeArray[i];
                } else {
                    while (element.childNodes[i].nodeType !== Node.ELEMENT_NODE) {
                        element.childNodes[i].remove();
                    }
                }
            } else {
                if (typeof tmChildNodeArray[i] !== 'object') {
                    element.insertBefore(document.createTextNode(tmChildNodeArray[i]), element.childNodes[i]);
                }
            }
        }
    }
    while (element.childNodes.length > tmChildNodeArray.length) {
        element.lastChild.remove();
    }
}

function LIS(arr) {
	let N = arr.length;
	let P = new Array(N).fill(0);
	let M = new Array(N + 1).fill(0);
	M[0] = -1;
	let L = 0;
	for (let i = 0; i < N; i++) {
		let low = 1, high = L + 1;
		while (low < high) {
			let mid = low + ((high - low) >> 1);
			if (arr[M[mid]] >= arr[i])
				high = mid;
			else
				low = mid + 1;
		}
		let newL = low;
		P[i] = M[newL - 1];
		M[newL] = i;
		if (newL > L) {
			L = newL;
		}
	}
	let S = new Array(L);
	let k = M[L];
	for (let j = L-1; j >= 0; j--) {
		S[j] = arr[k];
		k = P[k];
	}
	return S;
}

/**
 * Sets a binding in a This.
 * @param {This} this - the This.
 * @param {string} bindingName - the name of the binding.
 * @param {HTMLElement} element - the element being bound.
 */
function setBinding(bindingName, element) {
    this.bindings[bindingName] = {
        element,
        rerender: () => rerenderByBinding.call(this, bindingName)
    };
}

/**
 * Creates an HTMLElement given an Elementable.
 * @param {Elementable} elementable - the Elementable.
 * @param {boolean} [includeOnMounts] - an option to include the aggregated onMounts functions. False by default.
 * @returns {HTMLElement | Node | {element: HTMLElement | Node, onMounts: Function[]}} the resulting 
 * HTMLElement or text-node, or an object containing the HTMLElement or text-node 
 * and the aggregated onMounts functions.
 */
function create(elementable, includeOnMounts = false) {
    const onMounts = [];
    let element = createElementFromElementable(elementable, onMounts);
    if (typeof element === 'string') element = document.createTextNode(element);
    return includeOnMounts ? {element, onMounts} : element;
}

/**
 * Replaces an HTMLElement with an Elementable. Handles onMounts.
 * @param {HTMLElement} element - the HTMLElement.
 * @param {Elementable} elementable - the Elementable.
 */
function replaceWith(element, elementable) {
    const {element: newElement, onMounts} = create(elementable, true);
    element.replaceWith(newElement);
    onMounts.forEach(om => om());
}

/**
 * Appends an Elementable to an HTMLElement. Handles onMounts.
 * @param {HTMLElement} element - the HTMLElement.
 * @param {Elementable} elementable - the Elementable.
 */
function appendChild(element, elementable) {
    const {element: newElement, onMounts} = create(elementable, true);
    element.appendChild(newElement);
    onMounts.forEach(om => om());
}

/**
 * Inserts an Elementable before an HTMLElement. Handles onMounts.
 * @param {HTMLElement} parentElement - the parent HTMLElement.
 * @param {HTMLElement | null} nextSiblingElement - the next sibling HTMLElement, or null to append.
 * @param {Elementable} elementable - the Elementable.
 */
function insertBefore(parentElement, nextSiblingElement, elementable) {
    const {element: newElement, onMounts} = create(elementable, true);
    parentElement.insertBefore(newElement, nextSiblingElement);
    onMounts.forEach(om => om());
}

export { create, replaceWith, appendChild, insertBefore };