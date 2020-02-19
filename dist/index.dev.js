(function () {
'use strict';

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function set_store_value(store, ret, value = ret) {
    store.set(value);
    return ret;
}
function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
class HtmlTag {
    constructor(html, anchor = null) {
        this.e = element('div');
        this.a = anchor;
        this.u(html);
    }
    m(target, anchor = null) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(target, this.n[i], anchor);
        }
        this.t = target;
    }
    u(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    p(html) {
        this.d();
        this.u(html);
        this.m(this.t, this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

const outroing = new Set();
let outros;
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const globals = (typeof window !== 'undefined' ? window : global);

function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

var t = {};

var exec$1 = function exec(command) {
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    document.execCommand(command, false, value);
};

var getTagsRecursive = function getTagsRecursive(element, tags) {
    tags = tags || (element && element.tagName ? [element.tagName] : []);

    if (element && element.parentNode) {
        element = element.parentNode;
    } else {
        return tags;
    }

    var tag = element.tagName;
    if (element.style && element.getAttribute) {
        [element.style.textAlign || element.getAttribute('align'), element.style.color || tag === 'FONT' && 'forecolor', element.style.backgroundColor && 'backcolor'].filter(function (item) {
            return item;
        }).forEach(function (item) {
            return tags.push(item);
        });
    }

    if (tag === 'DIV') {
        return tags;
    }

    tags.push(tag);

    return getTagsRecursive(element, tags).filter(function (_tag) {
        return _tag != null;
    });
};

var saveRange = function saveRange(editor) {
    var documentSelection = document.getSelection();

    t.range = null;

    if (documentSelection.rangeCount) {
        var savedRange = t.range = documentSelection.getRangeAt(0);
        var range = document.createRange();
        var rangeStart = void 0;
        range.selectNodeContents(editor);
        range.setEnd(savedRange.startContainer, savedRange.startOffset);
        rangeStart = (range + '').length;
        t.metaRange = {
            start: rangeStart,
            end: rangeStart + (savedRange + '').length
        };
    }
};
var restoreRange = function restoreRange(editor) {
    var metaRange = t.metaRange;
    var savedRange = t.range;
    var documentSelection = document.getSelection();
    var range = void 0;

    if (!savedRange) {
        return;
    }

    if (metaRange && metaRange.start !== metaRange.end) {
        // Algorithm from http://jsfiddle.net/WeWy7/3/
        var charIndex = 0,
            nodeStack = [editor],
            node = void 0,
            foundStart = false,
            stop = false;

        range = document.createRange();

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType === 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && metaRange.start >= charIndex && metaRange.start <= nextCharIndex) {
                    range.setStart(node, metaRange.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && metaRange.end >= charIndex && metaRange.end <= nextCharIndex) {
                    range.setEnd(node, metaRange.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var cn = node.childNodes;
                var i = cn.length;

                while (i > 0) {
                    i -= 1;
                    nodeStack.push(cn[i]);
                }
            }
        }
    }

    documentSelection.removeAllRanges();
    documentSelection.addRange(range || savedRange);
};

var cleanHtml = function cleanHtml(input) {
    var html = input.match(/<!--StartFragment-->(.*?)<!--EndFragment-->/);
    var output = html && html[1] || input;
    output = output.replace(/\r?\n|\r/g, ' ').replace(/<!--(.*?)-->/g, '').replace(new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font|w:sdt)(.*?)>', 'gi'), '').replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi, '').replace(/style="[^"]*"/gi, '').replace(/style='[^']*'/gi, '').replace(/&nbsp;/gi, ' ').replace(/>(\s+)</g, '><').replace(/class="[^"]*"/gi, '').replace(/class='[^']*'/gi, '').replace(/<[^/].*?>/g, function (i) {
        return i.split(/[ >]/g)[0] + '>';
    }).trim();

    output = removeBadTags(output);
    return output;
};

var unwrap = function unwrap(wrapper) {
    var docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
        var child = wrapper.removeChild(wrapper.firstChild);
        docFrag.appendChild(child);
    }

    // replace wrapper with document fragment
    wrapper.parentNode.replaceChild(docFrag, wrapper);
};

var removeBlockTagsRecursive = function removeBlockTagsRecursive(elements, tagsToRemove) {
    Array.from(elements).forEach(function (item) {
        if (tagsToRemove.some(function (tag) {
            return tag === item.tagName.toLowerCase();
        })) {
            if (item.children.length) {
                removeBlockTagsRecursive(item.children, tagsToRemove);
            }
            unwrap(item);
        }
    });
};

var getActionBtns = function getActionBtns(actions) {
    return Object.keys(actions).map(function (action) {
        return actions[action];
    });
};

var getNewActionObj = function getNewActionObj(actions) {
    var userActions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (userActions && userActions.length) {
        var newActions = {};
        userActions.forEach(function (action) {
            if (typeof action === 'string') {
                newActions[action] = Object.assign({}, actions[action]);
            } else if (actions[action.name]) {
                newActions[action.name] = Object.assign(actions[action.name], action);
            } else {
                newActions[action.name] = Object.assign({}, action);
            }
        });

        return newActions;
    } else {
        return actions;
    }
};

var removeBadTags = function removeBadTags(html) {
    ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'].forEach(function (badTag) {
        html = html.replace(new RegExp('<' + badTag + '.*?' + badTag + '(.*?)>', 'gi'), '');
    });

    return html;
};

var isEditorClick = function isEditorClick(target, editorWrapper) {
    if (target === editorWrapper) {
        return true;
    }
    if (target.parentElement) {
        return isEditorClick(target.parentElement, editorWrapper);
    }
    return false;
};

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe$$1(run$$1, invalidate = noop) {
        const subscriber = [run$$1, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run$$1(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe: subscribe$$1 };
}

var linkSvg = '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>';
var unlinkSvg = '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"></path><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"></path></svg>';

var defaultActions = {
	viewHtml: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"></path></svg>',
		title: "View HTML",
		result: function result() {
			var _this = this;

			var refs = get_store_value(this.refs);
			var actionObj = get_store_value(this.state).actionObj;
			var helper = get_store_value(this.helper);

			helper.showEditor = !helper.showEditor;
			refs.editor.style.display = helper.showEditor ? "block" : "none";
			refs.raw.style.display = helper.showEditor ? "none" : "block";
			if (helper.showEditor) {
				refs.editor.innerHTML = refs.raw.value;
			} else {
				refs.raw.value = refs.editor.innerHTML;
			}
			setTimeout(function () {
				Object.keys(actionObj).forEach(function (action) {
					return actionObj[action].disabled = !helper.showEditor;
				});
				actionObj.viewHtml.disabled = false;
				actionObj.viewHtml.active = !helper.showEditor;

				_this.state.update(function (state) {
					state.actionBtns = getActionBtns(actionObj);
					state.actionObj = actionObj;
					return state;
				});
			});
		}
	},
	undo: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M61.2 51.2c0-5.1-2.1-9.7-5.4-13.1-3.3-3.3-8-5.4-13.1-5.4H26.1v-12L10.8 36l15.3 15.3V39.1h16.7c3.3 0 6.4 1.3 8.5 3.5 2.2 2.2 3.5 5.2 3.5 8.5h6.4z"></path></svg>',
		title: "Undo",
		result: function result() {
			return exec$1("undo");
		}
	},
	redo: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M10.8 51.2c0-5.1 2.1-9.7 5.4-13.1 3.3-3.3 8-5.4 13.1-5.4H46v-12L61.3 36 45.9 51.3V39.1H29.3c-3.3 0-6.4 1.3-8.5 3.5-2.2 2.2-3.5 5.2-3.5 8.5h-6.5z"></path></svg>',
		title: "Redo",
		result: function result() {
			return exec$1("redo");
		}
	},
	b: {
		icon: "<b>B</b>",
		title: "Bold",
		result: function result() {
			return exec$1("bold");
		}
	},
	i: {
		icon: "<i>I</i>",
		title: "Italic",
		result: function result() {
			return exec$1("italic");
		}
	},
	u: {
		icon: "<u>U</u>",
		title: "Underline",
		result: function result() {
			return exec$1("underline");
		}
	},
	strike: {
		icon: "<strike>S</strike>",
		title: "Strike-through",
		result: function result() {
			return exec$1("strikeThrough");
		}
	},
	sup: {
		icon: "A<sup>2</sup>",
		title: "Superscript",
		result: function result() {
			return exec$1("superscript");
		}
	},
	sub: {
		icon: "A<sub>2</sub>",
		title: "Subscript",
		result: function result() {
			return exec$1("subscript");
		}
	},
	h1: {
		icon: "<b>H<sub>1</sub></b>",
		title: "Heading 1",
		result: function result() {
			return exec$1("formatBlock", "<H1>");
		}
	},
	h2: {
		icon: "<b>H<sub>2</sub></b>",
		title: "Heading 2",
		result: function result() {
			return exec$1("formatBlock", "<H2>");
		}
	},
	p: {
		icon: "&#182;",
		title: "Paragraph",
		result: function result() {
			return exec$1("formatBlock", "<P>");
		}
	},
	blockquote: {
		icon: "&#8220; &#8221;",
		title: "Quote",
		result: function result() {
			return exec$1("formatBlock", "<BLOCKQUOTE>");
		}
	},
	ol: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"></path></svg>',
		title: "Ordered List",
		result: function result() {
			return exec$1("insertOrderedList");
		}
	},
	ul: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"></path></svg>',
		title: "Unordered List",
		result: function result() {
			return exec$1("insertUnorderedList");
		}
	},
	hr: {
		icon: "&#8213;",
		title: "Horizontal Line",
		result: function result() {
			return exec$1("insertHorizontalRule");
		}
	},
	left: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h36v8H9z"></path></svg>',
		title: "Justify left",
		result: function result() {
			return exec$1("justifyLeft");
		}
	},
	right: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM27 32h36v8H27z"></path></svg>',
		title: "Justify right",
		result: function result() {
			return exec$1("justifyRight");
		}
	},
	center: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM18 32h36v8H18z"></path></svg>',
		title: "Justify center",
		result: function result() {
			return exec$1("justifyCenter");
		}
	},
	justify: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h54v8H9z"></path></svg>',
		title: "Justify full",
		result: function result() {
			return exec$1("justifyFull");
		}
	},
	a: {
		icon: linkSvg,
		title: "Insert link",
		result: function result() {
			var _this2 = this;

			var actionObj = get_store_value(this.state).actionObj;
			var refs = get_store_value(this.refs);

			if (actionObj.a.active) {
				var selection = window.getSelection();
				var range = document.createRange();
				range.selectNodeContents(document.getSelection().focusNode);
				selection.removeAllRanges();
				selection.addRange(range);
				exec$1("unlink");
				actionObj.a.title = "Insert link";
				actionObj.a.icon = linkSvg;
				this.state.update(function (state) {
					state.actionBtn = getActionBtns(actionObj);
					state.actionObj = actionObj;
					return state;
				});
			} else {
				saveRange(refs.editor);
				refs.modal.$set({
					show: true,
					event: "linkUrl",
					title: "Insert link",
					label: "Url"
				});
				if (!get_store_value(this.helper).link) {
					this.helper.update(function (state) {
						state.link = true;
						return state;
					});
					refs.modal.$on("linkUrl", function (event) {
						restoreRange(refs.editor);
						exec$1("createLink", event.detail);
						actionObj.a.title = "Unlink";
						actionObj.a.icon = unlinkSvg;

						_this2.state.update(function (state) {
							state.actionBtn = getActionBtns(actionObj);
							state.actionObj = actionObj;
							return state;
						});
					});
				}
			}
		}
	},
	image: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"></path><path d="M17.5 22C15 22 13 24 13 26.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zM16 50h27L29.5 32zM36 36.2l8.9-8.5L60.2 50H45.9S35.6 35.9 36 36.2z"></path></svg>',
		title: "Image",
		result: function result() {
			var actionObj = get_store_value(this.state).actionObj;
			var refs = get_store_value(this.refs);
			saveRange(refs.editor);
			refs.modal.$set({
				show: true,
				event: "imageUrl",
				title: "Insert image",
				label: "Url"
			});
			if (!get_store_value(this.helper).image) {
				this.helper.update(function (state) {
					state.image = true;return state;
				});
				refs.modal.$on("imageUrl", function (event) {
					restoreRange(refs.editor);
					exec$1("insertImage", event.detail);
				});
			}
		}
	},
	forecolor: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M32 15h7.8L56 57.1h-7.9l-4-11.1H27.4l-4 11.1h-7.6L32 15zm-2.5 25.4h12.9L36 22.3h-.2l-6.3 18.1z"></path></svg>',
		title: "Text color",
		colorPicker: true,
		result: function result() {
			showColorPicker.call(this, "foreColor");
		}
	},
	backcolor: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"></path><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"></path></svg>',
		title: "Background color",
		colorPicker: true,
		result: function result() {
			showColorPicker.call(this, "backColor");
		}
	},
	removeFormat: {
		icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M58.2 54.6L52 48.5l3.6-3.6 6.1 6.1 6.4-6.4 3.8 3.8-6.4 6.4 6.1 6.1-3.6 3.6-6.1-6.1-6.4 6.4-3.7-3.8 6.4-6.4zM21.7 52.1H50V57H21.7zM18.8 15.2h34.1v6.4H39.5v24.2h-7.4V21.5H18.8v-6.3z"></path></svg>',
		title: "Remove format",
		result: function result() {
			var refs = get_store_value(this.refs);
			var selection = window.getSelection();
			if (!selection.toString().length) {
				removeBlockTagsRecursive(refs.editor.children, this.removeFormatTags);
				var range = document.createRange();
				range.selectNodeContents(refs.editor);
				selection.removeAllRanges();
				selection.addRange(range);
			}
			exec$1("removeFormat");
			selection.removeAllRanges();
		}
	}
};

var showColorPicker = function showColorPicker(cmd) {
	var _this3 = this;

	var refs = get_store_value(this.refs);
	saveRange(refs.editor);
	console.log(refs.colorPicker);
	refs.colorPicker.$set({ show: true, event: cmd });
	if (!get_store_value(this.helper)[cmd]) {
		this.helper.update(function (state) {
			state[cmd] = true;return state;
		});
		refs.colorPicker.$on(cmd, function (event) {
			var item = event.detail;
			if (item.modal) {
				_this3.modal.showModal({
					show: true,
					event: "colorHref",
					title: "Text color",
					label: cmd === "foreColor" ? "Text color" : "Background color"
				});
				var command = cmd;
				if (!get_store_value(_this3.helper)[command + "Modal"]) {
					get_store_value(_this3.helper)[command + "Modal"] = true;
					_this3.modal.$on("colorHref", function (event) {
						var color = event.detail;
						restoreRange(refs.editor);
						exec$1(command, color);
					});
				}
			} else {
				restoreRange(refs.editor);
				exec$1(cmd, item.color);
			}
		});
	}
};

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self$$1, call) { if (!self$$1) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self$$1; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* src/helpers/EditorModal.svelte generated by Svelte v3.18.2 */
function add_css$1() {
	var style = element("style");
	style.id = "svelte-1d1bzev-style";
	style.textContent = ".cl-editor-modal.svelte-1d1bzev.svelte-1d1bzev{position:absolute;top:37px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);max-width:520px;width:100%;height:140px;backface-visibility:hidden;z-index:11}.cl-editor-overlay.svelte-1d1bzev.svelte-1d1bzev{position:absolute;background-color:rgba(255,255,255,.5);height:100%;width:100%;left:0;top:0;z-index:10}.modal-box.svelte-1d1bzev.svelte-1d1bzev{position:absolute;top:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);max-width:500px;width:calc(100% - 20px);padding-bottom:36px;z-index:1;background-color:#FFF;text-align:center;font-size:14px;box-shadow:rgba(0,0,0,.2) 0 2px 3px;-webkit-backface-visibility:hidden;backface-visibility:hidden}.modal-title.svelte-1d1bzev.svelte-1d1bzev{font-size:24px;font-weight:700;margin:0 0 20px;padding:2px 0 4px;display:block;border-bottom:1px solid #EEE;color:#333;background:#fbfcfc}.modal-label.svelte-1d1bzev.svelte-1d1bzev{display:block;position:relative;margin:15px 12px;height:29px;line-height:29px;overflow:hidden}.modal-label.svelte-1d1bzev input.svelte-1d1bzev{position:absolute;top:0;right:0;height:27px;line-height:25px;border:1px solid #DEDEDE;background:#fff;font-size:14px;max-width:330px;width:70%;padding:0 7px;transition:all 150ms}.modal-label.svelte-1d1bzev input.svelte-1d1bzev:focus{outline:none}.input-error.svelte-1d1bzev input.svelte-1d1bzev{border:1px solid #e74c3c}.input-info.svelte-1d1bzev.svelte-1d1bzev{display:block;text-align:left;height:25px;line-height:25px;transition:all 150ms}.input-info.svelte-1d1bzev span.svelte-1d1bzev{display:block;color:#69878f;background-color:#fbfcfc;border:1px solid #DEDEDE;padding:0 7px;width:150px}.input-error.svelte-1d1bzev .input-info.svelte-1d1bzev{margin-top:-27px}.input-error.svelte-1d1bzev .msg-error.svelte-1d1bzev{color:#e74c3c}.modal-button.svelte-1d1bzev.svelte-1d1bzev{position:absolute;bottom:10px;right:0;text-decoration:none;color:#FFF;display:block;width:100px;height:35px;line-height:33px;margin:0 10px;background-color:#333;border:none;cursor:pointer;font-family:\"Lato\",Helvetica,Verdana,sans-serif;font-size:16px;transition:all 150ms}.modal-submit.svelte-1d1bzev.svelte-1d1bzev{right:110px;background:#2bc06a}.modal-reset.svelte-1d1bzev.svelte-1d1bzev{color:#555;background:#e6e6e6}";
	append(document.head, style);
}

// (12:24) {#if error}
function create_if_block(ctx) {
	var span = void 0;

	return {
		c: function c() {
			span = element("span");
			span.textContent = "Required";
			attr(span, "class", "msg-error svelte-1d1bzev");
		},
		m: function m(target, anchor) {
			insert(target, span, anchor);
		},
		d: function d(detaching) {
			if (detaching) detach(span);
		}
	};
}

function create_fragment$1(ctx) {
	var div3 = void 0;
	var div0 = void 0;
	var t0 = void 0;
	var div2 = void 0;
	var div1 = void 0;
	var span0 = void 0;
	var t1 = void 0;
	var t2 = void 0;
	var form = void 0;
	var label_1 = void 0;
	var input = void 0;
	var t3 = void 0;
	var span2 = void 0;
	var span1 = void 0;
	var t4 = void 0;
	var t5 = void 0;
	var t6 = void 0;
	var button0 = void 0;
	var t8 = void 0;
	var button1 = void 0;
	var dispose = void 0;
	var if_block = /*error*/ctx[4] && create_if_block(ctx);

	return {
		c: function c() {
			div3 = element("div");
			div0 = element("div");
			t0 = space();
			div2 = element("div");
			div1 = element("div");
			span0 = element("span");
			t1 = text( /*title*/ctx[2]);
			t2 = space();
			form = element("form");
			label_1 = element("label");
			input = element("input");
			t3 = space();
			span2 = element("span");
			span1 = element("span");
			t4 = text( /*label*/ctx[3]);
			t5 = space();
			if (if_block) if_block.c();
			t6 = space();
			button0 = element("button");
			button0.textContent = "Confirm";
			t8 = space();
			button1 = element("button");
			button1.textContent = "Cancel";
			attr(div0, "class", "cl-editor-overlay svelte-1d1bzev");
			attr(span0, "class", "modal-title svelte-1d1bzev");
			attr(input, "type", "text");
			attr(input, "name", "text");
			attr(input, "class", "svelte-1d1bzev");
			attr(span1, "class", "svelte-1d1bzev");
			attr(span2, "class", "input-info svelte-1d1bzev");
			attr(label_1, "class", "modal-label svelte-1d1bzev");
			toggle_class(label_1, "input-error", /*error*/ctx[4]);
			attr(button0, "class", "modal-button modal-submit svelte-1d1bzev");
			attr(button0, "type", "submit");
			attr(button1, "class", "modal-button modal-reset svelte-1d1bzev");
			attr(button1, "type", "reset");
			attr(div1, "class", "modal-box svelte-1d1bzev");
			attr(div2, "class", "cl-editor-modal svelte-1d1bzev");
			set_style(div3, "display", /*show*/ctx[0] ? "block" : "none");
		},
		m: function m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div0);
			append(div3, t0);
			append(div3, div2);
			append(div2, div1);
			append(div1, span0);
			append(span0, t1);
			append(div1, t2);
			append(div1, form);
			append(form, label_1);
			append(label_1, input);
			/*input_binding*/ctx[12](input);
			set_input_value(input, /*text*/ctx[1]);
			append(label_1, t3);
			append(label_1, span2);
			append(span2, span1);
			append(span1, t4);
			append(span2, t5);
			if (if_block) if_block.m(span2, null);
			append(form, t6);
			append(form, button0);
			append(form, t8);
			append(form, button1);

			dispose = [listen(div0, "click", /*cancel*/ctx[7]), listen(input, "keyup", /*hideError*/ctx[8]), listen(input, "input", /*input_input_handler*/ctx[13]), listen(button1, "click", /*cancel*/ctx[7]), listen(form, "submit", prevent_default( /*submit_handler*/ctx[14]))];
		},
		p: function p(ctx, _ref) {
			var _ref2 = _slicedToArray(_ref, 1),
			    dirty = _ref2[0];

			if (dirty & /*title*/4) set_data(t1, /*title*/ctx[2]);

			if (dirty & /*text*/2 && input.value !== /*text*/ctx[1]) {
				set_input_value(input, /*text*/ctx[1]);
			}

			if (dirty & /*label*/8) set_data(t4, /*label*/ctx[3]);

			if ( /*error*/ctx[4]) {
				if (!if_block) {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(span2, null);
				} else {}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*error*/16) {
				toggle_class(label_1, "input-error", /*error*/ctx[4]);
			}

			if (dirty & /*show*/1) {
				set_style(div3, "display", /*show*/ctx[0] ? "block" : "none");
			}
		},

		i: noop,
		o: noop,
		d: function d(detaching) {
			if (detaching) detach(div3);
			/*input_binding*/ctx[12](null);
			if (if_block) if_block.d();
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	var dispatcher = new createEventDispatcher();
	var _$$props$show = $$props.show,
	    show = _$$props$show === undefined ? false : _$$props$show;
	var _$$props$text = $$props.text,
	    text$$1 = _$$props$text === undefined ? "" : _$$props$text;
	var _$$props$event = $$props.event,
	    event = _$$props$event === undefined ? "" : _$$props$event;
	var _$$props$title = $$props.title,
	    title = _$$props$title === undefined ? "" : _$$props$title;
	var _$$props$label = $$props.label,
	    label = _$$props$label === undefined ? "" : _$$props$label;
	var _$$props$error = $$props.error,
	    error = _$$props$error === undefined ? false : _$$props$error;

	var refs = {};

	function confirm() {
		if (text$$1) {
			console.log("dispatcher", text$$1, event);
			dispatcher(event, text$$1);
			cancel();
		} else {
			$$invalidate(4, error = true);
			refs.text.focus();
		}
	}

	function cancel() {
		$$invalidate(0, show = false);
		$$invalidate(1, text$$1 = "");
		$$invalidate(4, error = false);
	}

	function hideError() {
		$$invalidate(4, error = false);
	}

	function showModal(options) {
		if (options.show) $$invalidate(0, show = options.show);
		if (options.text) $$invalidate(1, text$$1 = options.text);
		if (options.event) $$invalidate(9, event = options.event);
		if (options.title) $$invalidate(2, title = options.title);
		if (options.label) $$invalidate(3, label = options.label);
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](function () {
			refs.text = $$value;
			$$invalidate(5, refs);
		});
	}

	function input_input_handler() {
		text$$1 = this.value;
		$$invalidate(1, text$$1);
	}

	var submit_handler = function submit_handler(event) {
		return confirm();
	};

	$$self.$set = function ($$props) {
		if ("show" in $$props) $$invalidate(0, show = $$props.show);
		if ("text" in $$props) $$invalidate(1, text$$1 = $$props.text);
		if ("event" in $$props) $$invalidate(9, event = $$props.event);
		if ("title" in $$props) $$invalidate(2, title = $$props.title);
		if ("label" in $$props) $$invalidate(3, label = $$props.label);
		if ("error" in $$props) $$invalidate(4, error = $$props.error);
	};

	$$self.$$.update = function () {
		if ($$self.$$.dirty & /*show, refs*/33) {
			$: {
				if (show) {
					setTimeout(function () {
						refs.text.focus();
					});
				}
			}
		}
	};

	return [show, text$$1, title, label, error, refs, confirm, cancel, hideError, event, showModal, dispatcher, input_binding, input_input_handler, submit_handler];
}

var EditorModal = function (_SvelteComponent) {
	_inherits$1(EditorModal, _SvelteComponent);

	function EditorModal(options) {
		_classCallCheck$1(this, EditorModal);

		var _this = _possibleConstructorReturn$1(this, (EditorModal.__proto__ || Object.getPrototypeOf(EditorModal)).call(this));

		if (!document.getElementById("svelte-1d1bzev-style")) add_css$1();

		init(_this, options, instance$1, create_fragment$1, safe_not_equal, {
			show: 0,
			text: 1,
			event: 9,
			title: 2,
			label: 3,
			error: 4,
			showModal: 10
		});
		return _this;
	}

	_createClass$1(EditorModal, [{
		key: "show",
		get: function get() {
			return this.$$.ctx[0];
		},
		set: function set(show) {
			this.$set({ show: show });
			flush();
		}
	}, {
		key: "text",
		get: function get() {
			return this.$$.ctx[1];
		},
		set: function set(text$$1) {
			this.$set({ text: text$$1 });
			flush();
		}
	}, {
		key: "event",
		get: function get() {
			return this.$$.ctx[9];
		},
		set: function set(event) {
			this.$set({ event: event });
			flush();
		}
	}, {
		key: "title",
		get: function get() {
			return this.$$.ctx[2];
		},
		set: function set(title) {
			this.$set({ title: title });
			flush();
		}
	}, {
		key: "label",
		get: function get() {
			return this.$$.ctx[3];
		},
		set: function set(label) {
			this.$set({ label: label });
			flush();
		}
	}, {
		key: "error",
		get: function get() {
			return this.$$.ctx[4];
		},
		set: function set(error) {
			this.$set({ error: error });
			flush();
		}
	}, {
		key: "showModal",
		get: function get() {
			return this.$$.ctx[10];
		}
	}]);

	return EditorModal;
}(SvelteComponent);

var _slicedToArray$1 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$2(self$$1, call) { if (!self$$1) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self$$1; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* src/helpers/EditorColorPicker.svelte generated by Svelte v3.18.2 */
function add_css$2() {
	var style = element("style");
	style.id = "svelte-njq4pk-style";
	style.textContent = ".color-picker-wrapper.svelte-njq4pk{border:1px solid #ecf0f1;border-top:none;background:#FFF;box-shadow:rgba(0,0,0,.1) 0 2px 3px;width:290px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);padding:0;position:absolute;top:37px;z-index:11}.color-picker-overlay.svelte-njq4pk{position:absolute;background-color:rgba(255,255,255,.5);height:100%;width:100%;left:0;top:0;z-index:10}.color-picker-btn.svelte-njq4pk{display:block;position:relative;float:left;height:20px;width:20px;border:1px solid #333;padding:0;margin:2px;line-height:35px;text-decoration:none;background:#FFF;color:#333!important;cursor:pointer;text-align:left;font-size:15px;transition:all 150ms;line-height:20px;padding:0px 5px}.color-picker-btn.svelte-njq4pk:hover::after{content:\" \";display:block;position:absolute;top:-5px;left:-5px;height:27px;width:27px;background:inherit;border:1px solid #FFF;box-shadow:#000 0 0 2px;z-index:10}";
	append(document.head, style);
}

function get_each_context$1(ctx, list, i) {
	var child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	return child_ctx;
}

// (4:8) {#each btns as btn}
function create_each_block$1(ctx) {
	var button = void 0;
	var t_value = ( /*btn*/ctx[9].text || "") + "";
	var t = void 0;
	var dispose = void 0;

	function click_handler() {
		var _ctx;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return (/*click_handler*/(_ctx = ctx)[8].apply(_ctx, [/*btn*/ctx[9]].concat(args))
		);
	}

	return {
		c: function c() {
			button = element("button");
			t = text(t_value);
			attr(button, "type", "button");
			attr(button, "class", "color-picker-btn svelte-njq4pk");
			set_style(button, "background-color", /*btn*/ctx[9].color);
		},
		m: function m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);
			dispose = listen(button, "click", click_handler);
		},
		p: function p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*btns*/2 && t_value !== (t_value = ( /*btn*/ctx[9].text || "") + "")) set_data(t, t_value);

			if (dirty & /*btns*/2) {
				set_style(button, "background-color", /*btn*/ctx[9].color);
			}
		},
		d: function d(detaching) {
			if (detaching) detach(button);
			dispose();
		}
	};
}

function create_fragment$2(ctx) {
	var div2 = void 0;
	var div0 = void 0;
	var t = void 0;
	var div1 = void 0;
	var dispose = void 0;
	var each_value = /*btns*/ctx[1];
	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c: function c() {
			div2 = element("div");
			div0 = element("div");
			t = space();
			div1 = element("div");

			for (var _i = 0; _i < each_blocks.length; _i += 1) {
				each_blocks[_i].c();
			}

			attr(div0, "class", "color-picker-overlay svelte-njq4pk");
			attr(div1, "class", "color-picker-wrapper svelte-njq4pk");
			set_style(div2, "display", /*show*/ctx[0] ? "block" : "none");
		},
		m: function m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			append(div2, t);
			append(div2, div1);

			for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
				each_blocks[_i2].m(div1, null);
			}

			dispose = listen(div0, "click", /*close*/ctx[2]);
		},
		p: function p(ctx, _ref) {
			var _ref2 = _slicedToArray$1(_ref, 1),
			    dirty = _ref2[0];

			if (dirty & /*btns, selectColor*/10) {
				each_value = /*btns*/ctx[1];
				var _i3 = void 0;

				for (_i3 = 0; _i3 < each_value.length; _i3 += 1) {
					var child_ctx = get_each_context$1(ctx, each_value, _i3);

					if (each_blocks[_i3]) {
						each_blocks[_i3].p(child_ctx, dirty);
					} else {
						each_blocks[_i3] = create_each_block$1(child_ctx);
						each_blocks[_i3].c();
						each_blocks[_i3].m(div1, null);
					}
				}

				for (; _i3 < each_blocks.length; _i3 += 1) {
					each_blocks[_i3].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*show*/1) {
				set_style(div2, "display", /*show*/ctx[0] ? "block" : "none");
			}
		},

		i: noop,
		o: noop,
		d: function d(detaching) {
			if (detaching) detach(div2);
			destroy_each(each_blocks, detaching);
			dispose();
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	var dispatcher = new createEventDispatcher();

	var colors = ["ffffff", "000000", "eeece1", "1f497d", "4f81bd", "c0504d", "9bbb59", "8064a2", "4bacc6", "f79646", "ffff00", "f2f2f2", "7f7f7f", "ddd9c3", "c6d9f0", "dbe5f1", "f2dcdb", "ebf1dd", "e5e0ec", "dbeef3", "fdeada", "fff2ca", "d8d8d8", "595959", "c4bd97", "8db3e2", "b8cce4", "e5b9b7", "d7e3bc", "ccc1d9", "b7dde8", "fbd5b5", "ffe694", "bfbfbf", "3f3f3f", "938953", "548dd4", "95b3d7", "d99694", "c3d69b", "b2a2c7", "b7dde8", "fac08f", "f2c314", "a5a5a5", "262626", "494429", "17365d", "366092", "953734", "76923c", "5f497a", "92cddc", "e36c09", "c09100", "7f7f7f", "0c0c0c", "1d1b10", "0f243e", "244061", "632423", "4f6128", "3f3151", "31859b", "974806", "7f6000"];

	var getBtns = function getBtns() {
		var btns = colors.map(function (color) {
			return { color: "#" + color };
		});
		btns.push({ text: "#", modal: true });
		return btns;
	};

	var _$$props$show = $$props.show,
	    show = _$$props$show === undefined ? false : _$$props$show;
	var _$$props$btns = $$props.btns,
	    btns = _$$props$btns === undefined ? [] : _$$props$btns;
	var _$$props$event = $$props.event,
	    event = _$$props$event === undefined ? "" : _$$props$event;


	onMount(function () {
		$$invalidate(1, btns = getBtns());
	});

	function close() {
		$$invalidate(0, show = false);
	}

	function selectColor(btn) {
		dispatcher(event, btn);
		close();
	}

	var click_handler = function click_handler(btn, event) {
		return selectColor(btn);
	};

	$$self.$set = function ($$props) {
		if ("show" in $$props) $$invalidate(0, show = $$props.show);
		if ("btns" in $$props) $$invalidate(1, btns = $$props.btns);
		if ("event" in $$props) $$invalidate(4, event = $$props.event);
	};

	return [show, btns, close, selectColor, event, dispatcher, colors, getBtns, click_handler];
}

var EditorColorPicker = function (_SvelteComponent) {
	_inherits$2(EditorColorPicker, _SvelteComponent);

	function EditorColorPicker(options) {
		_classCallCheck$2(this, EditorColorPicker);

		var _this = _possibleConstructorReturn$2(this, (EditorColorPicker.__proto__ || Object.getPrototypeOf(EditorColorPicker)).call(this));

		if (!document.getElementById("svelte-njq4pk-style")) add_css$2();
		init(_this, options, instance$2, create_fragment$2, safe_not_equal, { show: 0, btns: 1, event: 4 });
		return _this;
	}

	return EditorColorPicker;
}(SvelteComponent);

var state = function state(name) {

    var state = {
        actionBtns: [],
        actionObj: {}
    };

    var _writable = writable(state),
        subscribe = _writable.subscribe,
        set = _writable.set,
        update = _writable.update;

    return {
        name: name,
        set: set,
        update: update,
        subscribe: subscribe
    };
};

var createStateStore = state;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self$$1, call) { if (!self$$1) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self$$1; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* src/Editor.svelte generated by Svelte v3.18.2 */
var document_1 = globals.document;


function add_css() {
	var style = element("style");
	style.id = "svelte-1a534py-style";
	style.textContent = ".cl.svelte-1a534py .svelte-1a534py{box-sizing:border-box}.cl.svelte-1a534py.svelte-1a534py{box-shadow:0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);box-sizing:border-box;width:100%;position:relative}.cl-content.svelte-1a534py.svelte-1a534py{height:300px;outline:0;overflow-y:auto;padding:10px;width:100%;background-color:white}.cl-actionbar.svelte-1a534py.svelte-1a534py{background-color:#ecf0f1;border-bottom:1px solid rgba(10, 10, 10, 0.1);width:100%}.cl-button.svelte-1a534py.svelte-1a534py{background-color:transparent;border:none;cursor:pointer;height:35px;outline:0;width:35px;vertical-align:top;position:relative}.cl-button.svelte-1a534py.svelte-1a534py:hover,.cl-button.active.svelte-1a534py.svelte-1a534py{background-color:#fff}.cl-button.svelte-1a534py.svelte-1a534py:disabled{opacity:.5;pointer-events:none}.cl-textarea.svelte-1a534py.svelte-1a534py{display:none;max-width:100%;min-width:100%;border:none;padding:10px}.cl-textarea.svelte-1a534py.svelte-1a534py:focus{outline:none}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	var child_ctx = ctx.slice();
	child_ctx[32] = list[i];
	return child_ctx;
}

// (8:4) {#each $state.actionBtns as action}
function create_each_block(ctx) {
	var button = void 0;
	var html_tag = void 0;
	var raw_value = /*action*/ctx[32].icon + "";
	var t = void 0;
	var button_class_value = void 0;
	var button_title_value = void 0;
	var button_disabled_value = void 0;
	var dispose = void 0;

	function click_handler_1() {
		var _ctx;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return (/*click_handler_1*/(_ctx = ctx)[24].apply(_ctx, [/*action*/ctx[32]].concat(args))
		);
	}

	return {
		c: function c() {
			button = element("button");
			t = space();
			html_tag = new HtmlTag(raw_value, t);
			attr(button, "class", button_class_value = "cl-button " + ( /*action*/ctx[32].active ? "active" : "") + " svelte-1a534py");
			attr(button, "title", button_title_value = /*action*/ctx[32].title);
			button.disabled = button_disabled_value = /*action*/ctx[32].disabled;
		},
		m: function m(target, anchor) {
			insert(target, button, anchor);
			html_tag.m(button);
			append(button, t);
			dispose = listen(button, "click", click_handler_1);
		},
		p: function p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*$state*/2 && raw_value !== (raw_value = /*action*/ctx[32].icon + "")) html_tag.p(raw_value);

			if (dirty[0] & /*$state*/2 && button_class_value !== (button_class_value = "cl-button " + ( /*action*/ctx[32].active ? "active" : "") + " svelte-1a534py")) {
				attr(button, "class", button_class_value);
			}

			if (dirty[0] & /*$state*/2 && button_title_value !== (button_title_value = /*action*/ctx[32].title)) {
				attr(button, "title", button_title_value);
			}

			if (dirty[0] & /*$state*/2 && button_disabled_value !== (button_disabled_value = /*action*/ctx[32].disabled)) {
				button.disabled = button_disabled_value;
			}
		},
		d: function d(detaching) {
			if (detaching) detach(button);
			dispose();
		}
	};
}

function create_fragment(ctx) {
	var div2 = void 0;
	var div0 = void 0;
	var t0 = void 0;
	var div1 = void 0;
	var t1 = void 0;
	var textarea = void 0;
	var t2 = void 0;
	var t3 = void 0;
	var current = void 0;
	var dispose = void 0;
	var each_value = /*$state*/ctx[1].actionBtns;
	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	var editormodal_props = {};
	var editormodal = new EditorModal({ props: editormodal_props });
	/*editormodal_binding*/ctx[29](editormodal);
	var editorcolorpicker_props = {};
	var editorcolorpicker = new EditorColorPicker({ props: editorcolorpicker_props });
	/*editorcolorpicker_binding*/ctx[30](editorcolorpicker);

	return {
		c: function c() {
			div2 = element("div");
			div0 = element("div");

			for (var _i = 0; _i < each_blocks.length; _i += 1) {
				each_blocks[_i].c();
			}

			t0 = space();
			div1 = element("div");
			t1 = space();
			textarea = element("textarea");
			t2 = space();
			create_component(editormodal.$$.fragment);
			t3 = space();
			create_component(editorcolorpicker.$$.fragment);
			attr(div0, "class", "cl-actionbar svelte-1a534py");
			attr(div1, "class", "cl-content svelte-1a534py");
			set_style(div1, "height", /*height*/ctx[0]);
			attr(div1, "contenteditable", "true");
			attr(textarea, "class", "cl-textarea svelte-1a534py");
			set_style(textarea, "max-height", /*height*/ctx[0]);
			set_style(textarea, "min-height", /*height*/ctx[0]);
			attr(div2, "class", "cl svelte-1a534py");
		},
		m: function m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);

			for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
				each_blocks[_i2].m(div0, null);
			}

			append(div2, t0);
			append(div2, div1);
			/*div1_binding*/ctx[25](div1);
			append(div2, t1);
			append(div2, textarea);
			/*textarea_binding*/ctx[28](textarea);
			append(div2, t2);
			mount_component(editormodal, div2, null);
			append(div2, t3);
			mount_component(editorcolorpicker, div2, null);
			/*div2_binding*/ctx[31](div2);
			current = true;

			dispose = [listen(window, "click", /*click_handler*/ctx[23]), listen(div1, "input", /*input_handler*/ctx[26]), listen(div1, "mouseup", /*_handleButtonStatus*/ctx[7]), listen(div1, "keyup", /*_handleButtonStatus*/ctx[7]), listen(div1, "paste", /*paste_handler*/ctx[27])];
		},
		p: function p(ctx, dirty) {
			if (dirty[0] & /*$state, _btnClicked*/66) {
				each_value = /*$state*/ctx[1].actionBtns;
				var _i3 = void 0;

				for (_i3 = 0; _i3 < each_value.length; _i3 += 1) {
					var child_ctx = get_each_context(ctx, each_value, _i3);

					if (each_blocks[_i3]) {
						each_blocks[_i3].p(child_ctx, dirty);
					} else {
						each_blocks[_i3] = create_each_block(child_ctx);
						each_blocks[_i3].c();
						each_blocks[_i3].m(div0, null);
					}
				}

				for (; _i3 < each_blocks.length; _i3 += 1) {
					each_blocks[_i3].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (!current || dirty[0] & /*height*/1) {
				set_style(div1, "height", /*height*/ctx[0]);
			}

			if (!current || dirty[0] & /*height*/1) {
				set_style(textarea, "max-height", /*height*/ctx[0]);
			}

			if (!current || dirty[0] & /*height*/1) {
				set_style(textarea, "min-height", /*height*/ctx[0]);
			}

			var editormodal_changes = {};
			editormodal.$set(editormodal_changes);
			var editorcolorpicker_changes = {};
			editorcolorpicker.$set(editorcolorpicker_changes);
		},
		i: function i(local) {
			if (current) return;
			transition_in(editormodal.$$.fragment, local);
			transition_in(editorcolorpicker.$$.fragment, local);
			current = true;
		},
		o: function o(local) {
			transition_out(editormodal.$$.fragment, local);
			transition_out(editorcolorpicker.$$.fragment, local);
			current = false;
		},
		d: function d(detaching) {
			if (detaching) detach(div2);
			destroy_each(each_blocks, detaching);
			/*div1_binding*/ctx[25](null);
			/*textarea_binding*/ctx[28](null);
			/*editormodal_binding*/ctx[29](null);
			destroy_component(editormodal);
			/*editorcolorpicker_binding*/ctx[30](null);
			destroy_component(editorcolorpicker);
			/*div2_binding*/ctx[31](null);
			run_all(dispose);
		}
	};
}

var editors = [];

function _onPaste(event) {
	event.preventDefault();

	exec$$1("insertHTML", event.clipboardData.getData("text/html") ? cleanHtml(event.clipboardData.getData("text/html")) : event.clipboardData.getData("text"));
}

function exec$$1(cmd, value) {
	exec$1(cmd, value);
}

function instance($$self, $$props, $$invalidate) {
	var $state = void 0;
	var $refs = void 0;
	var $helper = void 0;
	var dispatcher = new createEventDispatcher();
	var _$$props$actions = $$props.actions,
	    actions = _$$props$actions === undefined ? [] : _$$props$actions;
	var _$$props$height = $$props.height,
	    height = _$$props$height === undefined ? "300px" : _$$props$height;
	var _$$props$html = $$props.html,
	    html = _$$props$html === undefined ? "" : _$$props$html;
	var _$$props$removeFormat = $$props.removeFormatTags,
	    removeFormatTags = _$$props$removeFormat === undefined ? ["h1", "h2", "blockquote"] : _$$props$removeFormat;


	var helper = writable({
		foreColor: false,
		backColor: false,
		foreColorModal: false,
		backColorModal: false,
		image: false,
		link: false,
		showEditor: true,
		blurActive: false
	});

	component_subscribe($$self, helper, function (value) {
		return $$invalidate(19, $helper = value);
	});
	editors.push({});
	var contextKey = "editor_" + editors.length;
	var state = createStateStore(contextKey);
	component_subscribe($$self, state, function (value) {
		return $$invalidate(1, $state = value);
	});
	var refs = writable({});
	component_subscribe($$self, refs, function (value) {
		return $$invalidate(2, $refs = value);
	});
	set_store_value(state, $state.actionObj = getNewActionObj(defaultActions, actions), $state);

	var context = {
		exec: exec$$1,
		getHtml: getHtml,
		getText: getText,
		setHtml: setHtml,
		saveRange: saveRange$$1,
		restoreRange: restoreRange$$1,
		helper: helper,
		refs: refs,
		state: state,
		removeFormatTags: removeFormatTags
	};

	setContext(contextKey, context);

	onMount(function () {
		//const data = this.options.data || {};
		set_store_value(state, $state.actionBtns = getActionBtns($state.actionObj), $state);

		setHtml(html);
	});

	function _btnClicked(action) {
		$refs.editor.focus();
		saveRange$$1($refs.editor);
		restoreRange$$1($refs.editor);
		action.result.call(context);
		_handleButtonStatus();
	}

	function _handleButtonStatus(clearBtns) {
		var tags = clearBtns ? [] : getTagsRecursive(document.getSelection().focusNode);

		Object.keys($state.actionObj).forEach(function (action) {
			return set_store_value(state, $state.actionObj[action].active = false, $state);
		});
		tags.forEach(function (tag) {
			return ($state.actionObj[tag.toLowerCase()] || {}).active = true;
		});
		set_store_value(state, $state.actionBtns = getActionBtns($state.actionObj), $state);
		state.set($state);
	}

	function _onChange(html) {
		dispatcher("change", html);
	}

	function _documentClick(event) {
		if (!isEditorClick(event.target, $refs.editorWrapper) && $helper.blurActive) {
			dispatcher("blur", event);
		}

		set_store_value(helper, $helper.blurActive = true, $helper);
	}

	function getHtml(sanitize) {
		return sanitize ? removeBadTags($refs.editor.innerHTML) : $refs.editor.innerHTML;
	}

	function getText() {
		return $refs.editor.innerText;
	}

	function setHtml(html, sanitize) {
		set_store_value(refs, $refs.editor.innerHTML = sanitize ? removeBadTags(html) : html || "", $refs);
	}

	function saveRange$$1() {
		saveRange($refs.editor);
	}

	function restoreRange$$1() {
		restoreRange($refs.editor);
	}

	var click_handler = function click_handler(event) {
		return _documentClick(event);
	};
	var click_handler_1 = function click_handler_1(action, event) {
		return _btnClicked(action);
	};

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](function () {
			$refs.editor = $$value;
			refs.set($refs);
		});
	}

	var input_handler = function input_handler(event) {
		return _onChange(event.target.innerHTML);
	};
	var paste_handler = function paste_handler(event) {
		return _onPaste(event);
	};

	function textarea_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](function () {
			$refs.raw = $$value;
			refs.set($refs);
		});
	}

	function editormodal_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](function () {
			$refs.modal = $$value;
			refs.set($refs);
		});
	}

	function editorcolorpicker_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](function () {
			$refs.colorPicker = $$value;
			refs.set($refs);
		});
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](function () {
			$refs.editorWrapper = $$value;
			refs.set($refs);
		});
	}

	$$self.$set = function ($$props) {
		if ("actions" in $$props) $$invalidate(10, actions = $$props.actions);
		if ("height" in $$props) $$invalidate(0, height = $$props.height);
		if ("html" in $$props) $$invalidate(11, html = $$props.html);
		if ("removeFormatTags" in $$props) $$invalidate(12, removeFormatTags = $$props.removeFormatTags);
	};

	return [height, $state, $refs, helper, state, refs, _btnClicked, _handleButtonStatus, _onChange, _documentClick, actions, html, removeFormatTags, exec$$1, getHtml, getText, setHtml, saveRange$$1, restoreRange$$1, $helper, dispatcher, contextKey, context, click_handler, click_handler_1, div1_binding, input_handler, paste_handler, textarea_binding, editormodal_binding, editorcolorpicker_binding, div2_binding];
}

var Editor = function (_SvelteComponent) {
	_inherits(Editor, _SvelteComponent);

	function Editor(options) {
		_classCallCheck(this, Editor);

		var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this));

		if (!document_1.getElementById("svelte-1a534py-style")) add_css();

		init(_this, options, instance, create_fragment, safe_not_equal, {
			actions: 10,
			height: 0,
			html: 11,
			removeFormatTags: 12,
			exec: 13,
			getHtml: 14,
			getText: 15,
			setHtml: 16,
			saveRange: 17,
			restoreRange: 18
		}, [-1, -1]);
		return _this;
	}

	_createClass(Editor, [{
		key: "actions",
		get: function get() {
			return this.$$.ctx[10];
		},
		set: function set(actions) {
			this.$set({ actions: actions });
			flush();
		}
	}, {
		key: "height",
		get: function get() {
			return this.$$.ctx[0];
		},
		set: function set(height) {
			this.$set({ height: height });
			flush();
		}
	}, {
		key: "html",
		get: function get() {
			return this.$$.ctx[11];
		},
		set: function set(html) {
			this.$set({ html: html });
			flush();
		}
	}, {
		key: "removeFormatTags",
		get: function get() {
			return this.$$.ctx[12];
		},
		set: function set(removeFormatTags) {
			this.$set({ removeFormatTags: removeFormatTags });
			flush();
		}
	}, {
		key: "exec",
		get: function get() {
			return exec$$1;
		}
	}, {
		key: "getHtml",
		get: function get() {
			return this.$$.ctx[14];
		}
	}, {
		key: "getText",
		get: function get() {
			return this.$$.ctx[15];
		}
	}, {
		key: "setHtml",
		get: function get() {
			return this.$$.ctx[16];
		}
	}, {
		key: "saveRange",
		get: function get() {
			return this.$$.ctx[17];
		}
	}, {
		key: "restoreRange",
		get: function get() {
			return this.$$.ctx[18];
		}
	}]);

	return Editor;
}(SvelteComponent);

var inlineEditor = void 0;
var inlineEdit = document.getElementById('inlineEdit');
inlineEdit.addEventListener('click', showEditor);

var editor = new Editor({
	target: document.getElementById('editor1')
});

var editor2 = new Editor({
	target: document.getElementById('editor2'),
	props: {
		actions: ['b', 'i', 'u', 'strike', 'h1', 'h2', 'p', {
			name: 'copy',
			icon: '&#128203;',
			title: 'Copy',
			result: function result() {
				var selection = window.getSelection();
				if (!selection.toString().length) {
					var range = document.createRange();
					range.selectNodeContents(editor2.refs.editor);
					selection.removeAllRanges();
					selection.addRange(range);
				}
				editor2.exec('copy');
			}
		}],
		html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a odio neque. Duis ac laoreet lacus.',
		height: '150px'
	}
});

function showEditor() {
	var html = inlineEdit.innerHTML;
	inlineEdit.innerHTML = '';
	inlineEditor = new Editor({
		target: inlineEdit,
		props: {
			actions: ['b', 'i', 'u', 'strike', 'removeFormat'],
			height: 'auto',
			html: html
		}
	});

	inlineEdit.removeEventListener('click', showEditor);

	inlineEditor.on('blur', function () {
		html = inlineEditor.getHtml();
		inlineEditor.destroy();
		inlineEdit.innerHTML = html;
		inlineEdit.addEventListener('click', showEditor);
	});
}

}());
//# sourceMappingURL=index.dev.js.map
