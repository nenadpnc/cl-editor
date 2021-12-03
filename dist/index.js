(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.clEditor = factory());
})(this, (function () { 'use strict';

    function noop() {}

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
      return a != a ? b == b : a !== b || a && typeof a === 'object' || typeof a === 'function';
    }

    function is_empty(obj) {
      return Object.keys(obj).length === 0;
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

    function set_store_value(store, ret, value) {
      store.set(value);
      return ret;
    }

    function action_destroyer(action_result) {
      return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
      target.appendChild(node);
    }

    function append_styles(target, style_sheet_id, styles) {
      const append_styles_to = get_root_for_style(target);

      if (!append_styles_to.getElementById(style_sheet_id)) {
        const style = element('style');
        style.id = style_sheet_id;
        style.textContent = styles;
        append_stylesheet(append_styles_to, style);
      }
    }

    function get_root_for_style(node) {
      if (!node) return document;
      const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;

      if (root && root.host) {
        return root;
      }

      return node.ownerDocument;
    }

    function append_stylesheet(node, style) {
      append(node.head || node, style);
    }

    function insert(target, node, anchor) {
      target.insertBefore(node, anchor || null);
    }

    function detach(node) {
      node.parentNode.removeChild(node);
    }

    function destroy_each(iterations, detaching) {
      for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i]) iterations[i].d(detaching);
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

    function empty() {
      return text('');
    }

    function listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      return () => node.removeEventListener(event, handler, options);
    }

    function prevent_default(fn) {
      return function (event) {
        event.preventDefault(); // @ts-ignore

        return fn.call(this, event);
      };
    }

    function attr(node, attribute, value) {
      if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
    }

    function children(element) {
      return Array.from(element.childNodes);
    }

    function set_data(text, data) {
      data = '' + data;
      if (text.wholeText !== data) text.data = data;
    }

    function set_input_value(input, value) {
      input.value = value == null ? '' : value;
    }

    function set_style(node, key, value, important) {
      node.style.setProperty(key, value, important ? 'important' : '');
    }

    function toggle_class(element, name, toggle) {
      element.classList[toggle ? 'add' : 'remove'](name);
    }

    function custom_event(type, detail, bubbles = false) {
      const e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, bubbles, false, detail);
      return e;
    }

    class HtmlTag {
      constructor() {
        this.e = this.n = null;
      }

      c(html) {
        this.h(html);
      }

      m(html, target, anchor = null) {
        if (!this.e) {
          this.e = element(target.nodeName);
          this.t = target;
          this.c(html);
        }

        this.i(anchor);
      }

      h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
      }

      i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
          insert(this.t, this.n[i], anchor);
        }
      }

      p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
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
      if (!current_component) throw new Error('Function called outside component initialization');
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
      if (flushing) return;
      flushing = true;

      do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
          const component = dirty_components[i];
          set_current_component(component);
          update(component.$$);
        }

        set_current_component(null);
        dirty_components.length = 0;

        while (binding_callbacks.length) binding_callbacks.pop()(); // then, once components are updated, call
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
        if (outroing.has(block)) return;
        outroing.add(block);
        outros.c.push(() => {
          outroing.delete(block);

          if (callback) {
            if (detach) block.d(1);
            callback();
          }
        });
        block.o(local);
      }
    }

    function create_component(block) {
      block && block.c();
    }

    function mount_component(component, target, anchor, customElement) {
      const {
        fragment,
        on_mount,
        on_destroy,
        after_update
      } = component.$$;
      fragment && fragment.m(target, anchor);

      if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
          const new_on_destroy = on_mount.map(run).filter(is_function);

          if (on_destroy) {
            on_destroy.push(...new_on_destroy);
          } else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
          }

          component.$$.on_mount = [];
        });
      }

      after_update.forEach(add_render_callback);
    }

    function destroy_component(component, detaching) {
      const $$ = component.$$;

      if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
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

      component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
    }

    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
      const parent_component = current_component;
      set_current_component(component);
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
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
      };
      append_styles && append_styles($$.root);
      let ready = false;
      $$.ctx = instance ? instance(component, options.props || {}, (i, ret, ...rest) => {
        const value = rest.length ? rest[0] : ret;

        if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
          if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
          if (ready) make_dirty(component, i);
        }

        return ret;
      }) : [];
      $$.update();
      ready = true;
      run_all($$.before_update); // `false` as a special case of no DOM component

      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

      if (options.target) {
        if (options.hydrate) {
          const nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

          $$.fragment && $$.fragment.l(nodes);
          nodes.forEach(detach);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          $$.fragment && $$.fragment.c();
        }

        if (options.intro) transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
      }

      set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */


    class SvelteComponent {
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }

      $on(type, callback) {
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }

      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }

    }

    let t = {};

    const exec = (command, value = null) => {
      document.execCommand(command, false, value);
    };

    const getTagsRecursive = (element, tags) => {
      tags = tags || (element && element.tagName ? [element.tagName] : []);

      if (element && element.parentNode) {
        element = element.parentNode;
      } else {
        return tags;
      }

      const tag = element.tagName;
      if (element.style && element.getAttribute) {
        [element.style.textAlign || element.getAttribute('align'), element.style.color || tag === 'FONT' && 'forecolor', element.style.backgroundColor && 'backcolor']
          .filter((item) => item)
          .forEach((item) => tags.push(item));
      }

      if (tag === 'DIV') {
        return tags;
      }

      tags.push(tag);

      return getTagsRecursive(element, tags).filter((_tag) => _tag != null);
    };

    const saveRange = (editor) => {
      const documentSelection = document.getSelection();

      t.range = null;

      if (documentSelection.rangeCount) {
        let savedRange = t.range = documentSelection.getRangeAt(0);
        let range = document.createRange();
        let rangeStart;
        range.selectNodeContents(editor);
        range.setEnd(savedRange.startContainer, savedRange.startOffset);
        rangeStart = (range + '').length;
        t.metaRange = {
          start: rangeStart,
          end: rangeStart + (savedRange + '').length
        };
      }
    };
    const restoreRange = (editor) => {
      let metaRange = t.metaRange;
      let savedRange = t.range;
      let documentSelection = document.getSelection();
      let range;

      if (!savedRange) {
        return;
      }

      if (metaRange && metaRange.start !== metaRange.end) { // Algorithm from http://jsfiddle.net/WeWy7/3/
        let charIndex = 0,
            nodeStack = [editor],
            node,
            foundStart = false,
            stop = false;

        range = document.createRange();

        while (!stop && (node = nodeStack.pop())) {
          if (node.nodeType === 3) {
            let nextCharIndex = charIndex + node.length;
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
            let cn = node.childNodes;
            let i = cn.length;

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

    const cleanHtml = (input) => {
      const html = input.match(/<!--StartFragment-->(.*?)<!--EndFragment-->/);
      let output = html && html[1] || input;
      output = output
        .replace(/\r?\n|\r/g, ' ')
        .replace(/<!--(.*?)-->/g, '')
        .replace(new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font|w:sdt)(.*?)>', 'gi'), '')
        .replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi, '')
        .replace(/style="[^"]*"/gi, '')
        .replace(/style='[^']*'/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/>(\s+)</g, '><')
        .replace(/class="[^"]*"/gi, '')
        .replace(/class='[^']*'/gi, '')
        .replace(/<[^/].*?>/g, i => i.split(/[ >]/g)[0] + '>')
        .trim();

        output = removeBadTags(output);
        return output;
    };

    const unwrap = (wrapper) => {
    	const docFrag = document.createDocumentFragment();
    	while (wrapper.firstChild) {
    		const child = wrapper.removeChild(wrapper.firstChild);
    		docFrag.appendChild(child);
    	}

    	// replace wrapper with document fragment
    	wrapper.parentNode.replaceChild(docFrag, wrapper);
    };

    const removeBlockTagsRecursive = (elements, tagsToRemove) => {
      Array.from(elements).forEach((item) => {
        if (tagsToRemove.some((tag) => tag === item.tagName.toLowerCase())) {
          if (item.children.length) {
            removeBlockTagsRecursive(item.children, tagsToRemove);
          }
          unwrap(item);
        }
      });
    };

    const getActionBtns = (actions) => {
      return Object.keys(actions).map((action) => actions[action]);
    };

    const getNewActionObj = (actions, userActions = []) => {
        if (userActions && userActions.length) {
          const newActions = {};
          userActions.forEach((action) => {
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

    const removeBadTags = (html) => {
      ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'].forEach((badTag) => {
        html = html.replace(new RegExp(`<${badTag}.*?${badTag}(.*?)>`, 'gi'), '');
      });

      return html;
    };

    const isEditorClick = (target, editorWrapper) => {
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
      const subscribers = new Set();

      function set(new_value) {
        if (safe_not_equal(value, new_value)) {
          value = new_value;

          if (stop) {
            // store is ready
            const run_queue = !subscriber_queue.length;

            for (const subscriber of subscribers) {
              subscriber[1]();
              subscriber_queue.push(subscriber, value);
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

      function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);

        if (subscribers.size === 1) {
          stop = start(set) || noop;
        }

        run(value);
        return () => {
          subscribers.delete(subscriber);

          if (subscribers.size === 0) {
            stop();
            stop = null;
          }
        };
      }

      return {
        set,
        update,
        subscribe
      };
    }

    const linkSvg =
    	'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>';
    const unlinkSvg =
    	'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"></path><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"></path></svg>';

    var defaultActions = {
    	viewHtml: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"></path></svg>',
    		title: "View HTML",
    		result: function() {
    			let refs = get_store_value(this.references);
    			let actionObj = get_store_value(this.state).actionObj;
    			let helper = get_store_value(this.helper);

    			helper.showEditor = !helper.showEditor;
    			refs.editor.style.display = helper.showEditor ? "block" : "none";
    			refs.raw.style.display = helper.showEditor ? "none" : "block";
    			if (helper.showEditor) {
    				refs.editor.innerHTML = refs.raw.value;
    			} else {
    				refs.raw.value = refs.editor.innerHTML;
    			}
    			setTimeout(() => {
    				Object.keys(actionObj).forEach(
    					action => (actionObj[action].disabled = !helper.showEditor)
    				);
    				actionObj.viewHtml.disabled = false;
    				actionObj.viewHtml.active = !helper.showEditor;

    				this.state.update(state => {
    					state.actionBtns = getActionBtns(actionObj);
    					state.actionObj = actionObj;
    					return state;
    				});
    			});
    		}
    	},
    	undo: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M61.2 51.2c0-5.1-2.1-9.7-5.4-13.1-3.3-3.3-8-5.4-13.1-5.4H26.1v-12L10.8 36l15.3 15.3V39.1h16.7c3.3 0 6.4 1.3 8.5 3.5 2.2 2.2 3.5 5.2 3.5 8.5h6.4z"></path></svg>',
    		title: "Undo",
    		result: () => exec("undo")
    	},
    	redo: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M10.8 51.2c0-5.1 2.1-9.7 5.4-13.1 3.3-3.3 8-5.4 13.1-5.4H46v-12L61.3 36 45.9 51.3V39.1H29.3c-3.3 0-6.4 1.3-8.5 3.5-2.2 2.2-3.5 5.2-3.5 8.5h-6.5z"></path></svg>',
    		title: "Redo",
    		result: () => exec("redo")
    	},
    	b: {
    		icon: "<b>B</b>",
    		title: "Bold",
    		result: () => exec("bold")
    	},
    	i: {
    		icon: "<i>I</i>",
    		title: "Italic",
    		result: () => exec("italic")
    	},
    	u: {
    		icon: "<u>U</u>",
    		title: "Underline",
    		result: () => exec("underline")
    	},
    	strike: {
    		icon: "<strike>S</strike>",
    		title: "Strike-through",
    		result: () => exec("strikeThrough")
    	},
    	sup: {
    		icon: "A<sup>2</sup>",
    		title: "Superscript",
    		result: () => exec("superscript")
    	},
    	sub: {
    		icon: "A<sub>2</sub>",
    		title: "Subscript",
    		result: () => exec("subscript")
    	},
    	h1: {
    		icon: "<b>H<sub>1</sub></b>",
    		title: "Heading 1",
    		result: () => exec("formatBlock", "<H1>")
    	},
    	h2: {
    		icon: "<b>H<sub>2</sub></b>",
    		title: "Heading 2",
    		result: () => exec("formatBlock", "<H2>")
    	},
    	p: {
    		icon: "&#182;",
    		title: "Paragraph",
    		result: () => exec("formatBlock", "<P>")
    	},
    	blockquote: {
    		icon: "&#8220; &#8221;",
    		title: "Quote",
    		result: () => exec("formatBlock", "<BLOCKQUOTE>")
    	},
    	ol: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"></path></svg>',
    		title: "Ordered List",
    		result: () => exec("insertOrderedList")
    	},
    	ul: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"></path></svg>',
    		title: "Unordered List",
    		result: () => exec("insertUnorderedList")
    	},
    	hr: {
    		icon: "&#8213;",
    		title: "Horizontal Line",
    		result: () => exec("insertHorizontalRule")
    	},
    	left: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h36v8H9z"></path></svg>',
    		title: "Justify left",
    		result: () => exec("justifyLeft")
    	},
    	right: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM27 32h36v8H27z"></path></svg>',
    		title: "Justify right",
    		result: () => exec("justifyRight")
    	},
    	center: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM18 32h36v8H18z"></path></svg>',
    		title: "Justify center",
    		result: () => exec("justifyCenter")
    	},
    	justify: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h54v8H9z"></path></svg>',
    		title: "Justify full",
    		result: () => exec("justifyFull")
    	},
    	a: {
    		icon: linkSvg,
    		title: "Insert link",
    		result: function() {
    			const actionObj = get_store_value(this.state).actionObj;
    			const refs = get_store_value(this.references);

    			if (actionObj.a.active) {
    				const selection = window.getSelection();
    				const range = document.createRange();
    				range.selectNodeContents(document.getSelection().focusNode);
    				selection.removeAllRanges();
    				selection.addRange(range);
    				exec("unlink");
    				actionObj.a.title = "Insert link";
    				actionObj.a.icon = linkSvg;
    				this.state.update(state => {
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
    					this.helper.update(state => {
    						state.link = true;
    						return state;
    					});
    					refs.modal.$on("linkUrl", event => {
    						restoreRange(refs.editor);
    						exec("createLink", event.detail);
    						actionObj.a.title = "Unlink";
    						actionObj.a.icon = unlinkSvg;

    						this.state.update(state => {
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
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"></path><path d="M17.5 22C15 22 13 24 13 26.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zM16 50h27L29.5 32zM36 36.2l8.9-8.5L60.2 50H45.9S35.6 35.9 36 36.2z"></path></svg>',
    		title: "Image",
    		result: function() {
    			const refs = get_store_value(this.references);
    			saveRange(refs.editor);
    			refs.modal.$set({
    				show: true,
    				event: "imageUrl",
    				title: "Insert image",
    				label: "Url"
    			});
    			if (!get_store_value(this.helper).image) {
    				this.helper.update(state => {
    					state.image = true;
    					return state;
    				});
    				refs.modal.$on("imageUrl", event => {
    					restoreRange(refs.editor);
    					exec("insertImage", event.detail);
    				});
    			}
    		}
    	},
    	forecolor: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M32 15h7.8L56 57.1h-7.9l-4-11.1H27.4l-4 11.1h-7.6L32 15zm-2.5 25.4h12.9L36 22.3h-.2l-6.3 18.1z"></path></svg>',
    		title: "Text color",
    		colorPicker: true,
    		result: function() {
    			showColorPicker.call(this, "foreColor");
    		}
    	},
    	backcolor: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"></path><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"></path></svg>',
    		title: "Background color",
    		colorPicker: true,
    		result: function() {
    			showColorPicker.call(this, "backColor");
    		}
    	},
    	removeFormat: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M58.2 54.6L52 48.5l3.6-3.6 6.1 6.1 6.4-6.4 3.8 3.8-6.4 6.4 6.1 6.1-3.6 3.6-6.1-6.1-6.4 6.4-3.7-3.8 6.4-6.4zM21.7 52.1H50V57H21.7zM18.8 15.2h34.1v6.4H39.5v24.2h-7.4V21.5H18.8v-6.3z"></path></svg>',
    		title: "Remove format",
    		result: function() {
    			const refs = get_store_value(this.references);
    			const selection = window.getSelection();
    			if (!selection.toString().length) {
    				removeBlockTagsRecursive(
    					refs.editor.children,
    					this.removeFormatTags
    				);
    				const range = document.createRange();
    				range.selectNodeContents(refs.editor);
    				selection.removeAllRanges();
    				selection.addRange(range);
    			}
    			exec("removeFormat");
    			selection.removeAllRanges();
    		}
    	}
    };

    const showColorPicker = function(cmd) {
    	const refs = get_store_value(this.references);
    	saveRange(refs.editor);
    	refs.colorPicker.$set({show: true, event: cmd});
    	if (!get_store_value(this.helper)[cmd]) {
    		this.helper.update(state => {
    			state[cmd] = true;
    			return state;
    		});
    		refs.colorPicker.$on(cmd, event => {
    			let item = event.detail;
    			if (item.modal) {
    				refs.modal.$set({
    					show: true,
    					event: `${cmd}Changed`,
    					title: "Text color",
    					label:
    						cmd === "foreColor" ? "Text color" : "Background color"
    				});
    				const command = cmd;
    				if (!get_store_value(this.helper)[`${command}Modal`]) {
    					get_store_value(this.helper)[`${command}Modal`] = true;
    					refs.modal.$on(`${command}Changed`, event => {
    						let color = event.detail;
    						restoreRange(refs.editor);
    						exec(command, color);
    					});
    				}
    			} else {
    				restoreRange(refs.editor);
    				exec(cmd, item.color);
    			}
    		});
    	}
    };

    /* src/helpers/EditorModal.svelte generated by Svelte v3.44.2 */

    function add_css$2(target) {
    	append_styles(target, "svelte-42yfje", ".cl-editor-modal.svelte-42yfje.svelte-42yfje{position:absolute;top:37px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);max-width:520px;width:100%;height:140px;backface-visibility:hidden;z-index:11}.cl-editor-overlay.svelte-42yfje.svelte-42yfje{position:absolute;background-color:rgba(255,255,255,.5);height:100%;width:100%;left:0;top:0;z-index:10}.modal-box.svelte-42yfje.svelte-42yfje{position:absolute;top:0;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);max-width:500px;width:calc(100% - 20px);padding-bottom:36px;z-index:1;background-color:#FFF;text-align:center;font-size:14px;box-shadow:rgba(0,0,0,.2) 0 2px 3px;-webkit-backface-visibility:hidden;backface-visibility:hidden}.modal-title.svelte-42yfje.svelte-42yfje{font-size:24px;font-weight:700;margin:0 0 20px;padding:2px 0 4px;display:block;border-bottom:1px solid #EEE;color:#333;background:#fbfcfc}.modal-label.svelte-42yfje.svelte-42yfje{display:block;position:relative;margin:15px 12px;height:29px;line-height:29px;overflow:hidden}.modal-label.svelte-42yfje input.svelte-42yfje{position:absolute;top:0;right:0;height:27px;line-height:25px;border:1px solid #DEDEDE;background:#fff;font-size:14px;max-width:330px;width:70%;padding:0 7px;transition:all 150ms}.modal-label.svelte-42yfje input.svelte-42yfje:focus{outline:none}.input-error.svelte-42yfje input.svelte-42yfje{border:1px solid #e74c3c}.input-info.svelte-42yfje.svelte-42yfje{display:block;text-align:left;height:25px;line-height:25px;transition:all 150ms}.input-info.svelte-42yfje span.svelte-42yfje{display:block;color:#69878f;background-color:#fbfcfc;border:1px solid #DEDEDE;padding:1px 7px;width:150px}.input-error.svelte-42yfje .input-info.svelte-42yfje{margin-top:-29px}.input-error.svelte-42yfje .msg-error.svelte-42yfje{color:#e74c3c}.modal-button.svelte-42yfje.svelte-42yfje{position:absolute;bottom:10px;right:0;text-decoration:none;color:#FFF;display:block;width:100px;height:35px;line-height:33px;margin:0 10px;background-color:#333;border:none;cursor:pointer;font-family:\"Lato\",Helvetica,Verdana,sans-serif;font-size:16px;transition:all 150ms}.modal-submit.svelte-42yfje.svelte-42yfje{right:110px;background:#2bc06a}.modal-reset.svelte-42yfje.svelte-42yfje{color:#555;background:#e6e6e6}");
    }

    // (2:0) {#if show}
    function create_if_block(ctx) {
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let span0;
    	let t1;
    	let t2;
    	let form;
    	let label_1;
    	let input;
    	let inputType_action;
    	let t3;
    	let span2;
    	let span1;
    	let t4;
    	let t5;
    	let t6;
    	let button0;
    	let t8;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block = /*error*/ ctx[2] && create_if_block_1();

    	return {
    		c() {
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			t1 = text(/*title*/ ctx[3]);
    			t2 = space();
    			form = element("form");
    			label_1 = element("label");
    			input = element("input");
    			t3 = space();
    			span2 = element("span");
    			span1 = element("span");
    			t4 = text(/*label*/ ctx[4]);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "Confirm";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr(div0, "class", "cl-editor-overlay svelte-42yfje");
    			attr(span0, "class", "modal-title svelte-42yfje");
    			attr(input, "name", "text");
    			attr(input, "class", "svelte-42yfje");
    			attr(span1, "class", "svelte-42yfje");
    			attr(span2, "class", "input-info svelte-42yfje");
    			attr(label_1, "class", "modal-label svelte-42yfje");
    			toggle_class(label_1, "input-error", /*error*/ ctx[2]);
    			attr(button0, "class", "modal-button modal-submit svelte-42yfje");
    			attr(button0, "type", "submit");
    			attr(button1, "class", "modal-button modal-reset svelte-42yfje");
    			attr(button1, "type", "reset");
    			attr(div1, "class", "modal-box svelte-42yfje");
    			attr(div2, "class", "cl-editor-modal svelte-42yfje");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t0, anchor);
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, span0);
    			append(span0, t1);
    			append(div1, t2);
    			append(div1, form);
    			append(form, label_1);
    			append(label_1, input);
    			/*input_binding*/ ctx[11](input);
    			set_input_value(input, /*text*/ ctx[1]);
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

    			if (!mounted) {
    				dispose = [
    					listen(div0, "click", /*cancel*/ ctx[8]),
    					listen(input, "keyup", /*hideError*/ ctx[9]),
    					action_destroyer(inputType_action = /*inputType*/ ctx[6].call(null, input)),
    					listen(input, "input", /*input_input_handler*/ ctx[12]),
    					listen(button1, "click", /*cancel*/ ctx[8]),
    					listen(form, "submit", prevent_default(/*submit_handler*/ ctx[13]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 8) set_data(t1, /*title*/ ctx[3]);

    			if (dirty & /*text*/ 2 && input.value !== /*text*/ ctx[1]) {
    				set_input_value(input, /*text*/ ctx[1]);
    			}

    			if (dirty & /*label*/ 16) set_data(t4, /*label*/ ctx[4]);

    			if (/*error*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1();
    					if_block.c();
    					if_block.m(span2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*error*/ 4) {
    				toggle_class(label_1, "input-error", /*error*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t0);
    			if (detaching) detach(div2);
    			/*input_binding*/ ctx[11](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (12:12) {#if error}
    function create_if_block_1(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Required";
    			attr(span, "class", "msg-error svelte-42yfje");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*show*/ ctx[0] && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let dispatcher = new createEventDispatcher();
    	let { show = false } = $$props;
    	let { text = '' } = $$props;
    	let { event = '' } = $$props;
    	let { title = '' } = $$props;
    	let { label = '' } = $$props;
    	let { error = false } = $$props;
    	let refs = {};

    	const inputType = e => {
    		e.type = event.includes('Color') ? 'color' : 'text';
    	};

    	function confirm() {
    		if (text) {
    			dispatcher(event, text);
    			cancel();
    		} else {
    			$$invalidate(2, error = true);
    			refs.text.focus();
    		}
    	}

    	function cancel() {
    		$$invalidate(0, show = false);
    		$$invalidate(1, text = '');
    		$$invalidate(2, error = false);
    	}

    	function hideError() {
    		$$invalidate(2, error = false);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refs.text = $$value;
    			$$invalidate(5, refs);
    		});
    	}

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(1, text);
    	}

    	const submit_handler = event => confirm();

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('event' in $$props) $$invalidate(10, event = $$props.event);
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    		if ('label' in $$props) $$invalidate(4, label = $$props.label);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show, refs*/ 33) {
    			{
    				if (show) {
    					setTimeout(() => {
    						refs.text.focus();
    					});
    				}
    			}
    		}
    	};

    	return [
    		show,
    		text,
    		error,
    		title,
    		label,
    		refs,
    		inputType,
    		confirm,
    		cancel,
    		hideError,
    		event,
    		input_binding,
    		input_input_handler,
    		submit_handler
    	];
    }

    class EditorModal extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				show: 0,
    				text: 1,
    				event: 10,
    				title: 3,
    				label: 4,
    				error: 2
    			},
    			add_css$2
    		);
    	}

    	get show() {
    		return this.$$.ctx[0];
    	}

    	set show(show) {
    		this.$$set({ show });
    		flush();
    	}

    	get text() {
    		return this.$$.ctx[1];
    	}

    	set text(text) {
    		this.$$set({ text });
    		flush();
    	}

    	get event() {
    		return this.$$.ctx[10];
    	}

    	set event(event) {
    		this.$$set({ event });
    		flush();
    	}

    	get title() {
    		return this.$$.ctx[3];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get label() {
    		return this.$$.ctx[4];
    	}

    	set label(label) {
    		this.$$set({ label });
    		flush();
    	}

    	get error() {
    		return this.$$.ctx[2];
    	}

    	set error(error) {
    		this.$$set({ error });
    		flush();
    	}
    }

    /* src/helpers/EditorColorPicker.svelte generated by Svelte v3.44.2 */

    function add_css$1(target) {
    	append_styles(target, "svelte-njq4pk", ".color-picker-wrapper.svelte-njq4pk{border:1px solid #ecf0f1;border-top:none;background:#FFF;box-shadow:rgba(0,0,0,.1) 0 2px 3px;width:290px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);padding:0;position:absolute;top:37px;z-index:11}.color-picker-overlay.svelte-njq4pk{position:absolute;background-color:rgba(255,255,255,.5);height:100%;width:100%;left:0;top:0;z-index:10}.color-picker-btn.svelte-njq4pk{display:block;position:relative;float:left;height:20px;width:20px;border:1px solid #333;padding:0;margin:2px;line-height:35px;text-decoration:none;background:#FFF;color:#333!important;cursor:pointer;text-align:left;font-size:15px;transition:all 150ms;line-height:20px;padding:0px 5px}.color-picker-btn.svelte-njq4pk:hover::after{content:\" \";display:block;position:absolute;top:-5px;left:-5px;height:27px;width:27px;background:inherit;border:1px solid #FFF;box-shadow:#000 0 0 2px;z-index:10}");
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (4:4) {#each btns as btn}
    function create_each_block$1(ctx) {
    	let button;
    	let t_value = (/*btn*/ ctx[8].text || '') + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*btn*/ ctx[8], ...args);
    	}

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "type", "button");
    			attr(button, "class", "color-picker-btn svelte-njq4pk");
    			set_style(button, "background-color", /*btn*/ ctx[8].color);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*btns*/ 2 && t_value !== (t_value = (/*btn*/ ctx[8].text || '') + "")) set_data(t, t_value);

    			if (dirty & /*btns*/ 2) {
    				set_style(button, "background-color", /*btn*/ ctx[8].color);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;
    	let each_value = /*btns*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "color-picker-overlay svelte-njq4pk");
    			attr(div1, "class", "color-picker-wrapper svelte-njq4pk");
    			set_style(div2, "display", /*show*/ ctx[0] ? 'block' : 'none');
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div2, t);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = listen(div0, "click", /*close*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*btns, selectColor*/ 10) {
    				each_value = /*btns*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*show*/ 1) {
    				set_style(div2, "display", /*show*/ ctx[0] ? 'block' : 'none');
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatcher = new createEventDispatcher();
    	let { show = false } = $$props;
    	let { btns = [] } = $$props;
    	let { event = '' } = $$props;
    	let { colors = [] } = $$props;

    	function close() {
    		$$invalidate(0, show = false);
    	}

    	function selectColor(btn) {
    		dispatcher(event, btn);
    		close();
    	}

    	const click_handler = (btn, event) => selectColor(btn);

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    		if ('btns' in $$props) $$invalidate(1, btns = $$props.btns);
    		if ('event' in $$props) $$invalidate(4, event = $$props.event);
    		if ('colors' in $$props) $$invalidate(5, colors = $$props.colors);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*colors*/ 32) {
    			$$invalidate(1, btns = colors.map(color => ({ color })).concat([{ text: '#', modal: true }]));
    		}
    	};

    	return [show, btns, close, selectColor, event, colors, click_handler];
    }

    class EditorColorPicker extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { show: 0, btns: 1, event: 4, colors: 5 }, add_css$1);
    	}
    }

    const state = (function(name) {
      let state = {
        actionBtns: [],
        actionObj: {}
      };

      const { subscribe, set, update } = writable(state);

      return {
        name,
        set,
        update,
        subscribe
      }
    });

    const createStateStore = state;

    /* src/Editor.svelte generated by Svelte v3.44.2 */

    function add_css(target) {
    	append_styles(target, "svelte-1a534py", ".cl.svelte-1a534py .svelte-1a534py{box-sizing:border-box}.cl.svelte-1a534py.svelte-1a534py{box-shadow:0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);box-sizing:border-box;width:100%;position:relative}.cl-content.svelte-1a534py.svelte-1a534py{height:300px;outline:0;overflow-y:auto;padding:10px;width:100%;background-color:white}.cl-actionbar.svelte-1a534py.svelte-1a534py{background-color:#ecf0f1;border-bottom:1px solid rgba(10, 10, 10, 0.1);width:100%}.cl-button.svelte-1a534py.svelte-1a534py{background-color:transparent;border:none;cursor:pointer;height:35px;outline:0;width:35px;vertical-align:top;position:relative}.cl-button.svelte-1a534py.svelte-1a534py:hover,.cl-button.active.svelte-1a534py.svelte-1a534py{background-color:#fff}.cl-button.svelte-1a534py.svelte-1a534py:disabled{opacity:.5;pointer-events:none}.cl-textarea.svelte-1a534py.svelte-1a534py{display:none;max-width:100%;min-width:100%;border:none;padding:10px}.cl-textarea.svelte-1a534py.svelte-1a534py:focus{outline:none}");
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    // (8:4) {#each $state.actionBtns as action}
    function create_each_block(ctx) {
    	let button;
    	let html_tag;
    	let raw_value = /*action*/ ctx[38].icon + "";
    	let t;
    	let button_class_value;
    	let button_title_value;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[24](/*action*/ ctx[38], ...args);
    	}

    	return {
    		c() {
    			button = element("button");
    			html_tag = new HtmlTag();
    			t = space();
    			html_tag.a = t;
    			attr(button, "type", "button");
    			attr(button, "class", button_class_value = "cl-button " + (/*action*/ ctx[38].active ? 'active' : '') + " svelte-1a534py");
    			attr(button, "title", button_title_value = /*action*/ ctx[38].title);
    			button.disabled = button_disabled_value = /*action*/ ctx[38].disabled;
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			html_tag.m(raw_value, button);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler_1);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$state*/ 16 && raw_value !== (raw_value = /*action*/ ctx[38].icon + "")) html_tag.p(raw_value);

    			if (dirty[0] & /*$state*/ 16 && button_class_value !== (button_class_value = "cl-button " + (/*action*/ ctx[38].active ? 'active' : '') + " svelte-1a534py")) {
    				attr(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*$state*/ 16 && button_title_value !== (button_title_value = /*action*/ ctx[38].title)) {
    				attr(button, "title", button_title_value);
    			}

    			if (dirty[0] & /*$state*/ 16 && button_disabled_value !== (button_disabled_value = /*action*/ ctx[38].disabled)) {
    				button.disabled = button_disabled_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let textarea;
    	let t2;
    	let editormodal;
    	let t3;
    	let editorcolorpicker;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$state*/ ctx[4].actionBtns;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let editormodal_props = {};
    	editormodal = new EditorModal({ props: editormodal_props });
    	/*editormodal_binding*/ ctx[31](editormodal);
    	let editorcolorpicker_props = { colors: /*colors*/ ctx[2] };
    	editorcolorpicker = new EditorColorPicker({ props: editorcolorpicker_props });
    	/*editorcolorpicker_binding*/ ctx[32](editorcolorpicker);

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
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
    			attr(div1, "id", /*contentId*/ ctx[1]);
    			attr(div1, "class", "cl-content svelte-1a534py");
    			set_style(div1, "height", /*height*/ ctx[0]);
    			attr(div1, "contenteditable", "true");
    			attr(textarea, "class", "cl-textarea svelte-1a534py");
    			set_style(textarea, "max-height", /*height*/ ctx[0]);
    			set_style(textarea, "min-height", /*height*/ ctx[0]);
    			attr(div2, "class", "cl svelte-1a534py");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div2, t0);
    			append(div2, div1);
    			/*div1_binding*/ ctx[25](div1);
    			append(div2, t1);
    			append(div2, textarea);
    			/*textarea_binding*/ ctx[30](textarea);
    			append(div2, t2);
    			mount_component(editormodal, div2, null);
    			append(div2, t3);
    			mount_component(editorcolorpicker, div2, null);
    			/*div2_binding*/ ctx[33](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(window, "click", /*click_handler*/ ctx[23]),
    					listen(div1, "input", /*input_handler*/ ctx[26]),
    					listen(div1, "mouseup", /*mouseup_handler*/ ctx[27]),
    					listen(div1, "keyup", /*keyup_handler*/ ctx[28]),
    					listen(div1, "paste", /*paste_handler*/ ctx[29])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*$state, _btnClicked*/ 272) {
    				each_value = /*$state*/ ctx[4].actionBtns;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*contentId*/ 2) {
    				attr(div1, "id", /*contentId*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*height*/ 1) {
    				set_style(div1, "height", /*height*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*height*/ 1) {
    				set_style(textarea, "max-height", /*height*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*height*/ 1) {
    				set_style(textarea, "min-height", /*height*/ ctx[0]);
    			}

    			const editormodal_changes = {};
    			editormodal.$set(editormodal_changes);
    			const editorcolorpicker_changes = {};
    			if (dirty[0] & /*colors*/ 4) editorcolorpicker_changes.colors = /*colors*/ ctx[2];
    			editorcolorpicker.$set(editorcolorpicker_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(editormodal.$$.fragment, local);
    			transition_in(editorcolorpicker.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(editormodal.$$.fragment, local);
    			transition_out(editorcolorpicker.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[25](null);
    			/*textarea_binding*/ ctx[30](null);
    			/*editormodal_binding*/ ctx[31](null);
    			destroy_component(editormodal);
    			/*editorcolorpicker_binding*/ ctx[32](null);
    			destroy_component(editorcolorpicker);
    			/*div2_binding*/ ctx[33](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    const editors = [];

    function instance($$self, $$props, $$invalidate) {
    	let $references;
    	let $helper;
    	let $state;
    	let dispatcher = new createEventDispatcher();
    	let { actions = [] } = $$props;
    	let { height = '300px' } = $$props;
    	let { html = '' } = $$props;
    	let { contentId = '' } = $$props;

    	let { colors = [
    		'#ffffff',
    		'#000000',
    		'#eeece1',
    		'#1f497d',
    		'#4f81bd',
    		'#c0504d',
    		'#9bbb59',
    		'#8064a2',
    		'#4bacc6',
    		'#f79646',
    		'#ffff00',
    		'#f2f2f2',
    		'#7f7f7f',
    		'#ddd9c3',
    		'#c6d9f0',
    		'#dbe5f1',
    		'#f2dcdb',
    		'#ebf1dd',
    		'#e5e0ec',
    		'#dbeef3',
    		'#fdeada',
    		'#fff2ca',
    		'#d8d8d8',
    		'#595959',
    		'#c4bd97',
    		'#8db3e2',
    		'#b8cce4',
    		'#e5b9b7',
    		'#d7e3bc',
    		'#ccc1d9',
    		'#b7dde8',
    		'#fbd5b5',
    		'#ffe694',
    		'#bfbfbf',
    		'#3f3f3f',
    		'#938953',
    		'#548dd4',
    		'#95b3d7',
    		'#d99694',
    		'#c3d69b',
    		'#b2a2c7',
    		'#b7dde8',
    		'#fac08f',
    		'#f2c314',
    		'#a5a5a5',
    		'#262626',
    		'#494429',
    		'#17365d',
    		'#366092',
    		'#953734',
    		'#76923c',
    		'#5f497a',
    		'#92cddc',
    		'#e36c09',
    		'#c09100',
    		'#7f7f7f',
    		'#0c0c0c',
    		'#1d1b10',
    		'#0f243e',
    		'#244061',
    		'#632423',
    		'#4f6128',
    		'#3f3151',
    		'#31859b',
    		'#974806',
    		'#7f6000'
    	] } = $$props;

    	let { removeFormatTags = ['h1', 'h2', 'blockquote'] } = $$props;

    	let helper = writable({
    		foreColor: false,
    		backColor: false,
    		foreColorModal: false,
    		backColorModal: false,
    		image: false,
    		link: false,
    		showEditor: true,
    		blurActive: false
    	});

    	component_subscribe($$self, helper, value => $$invalidate(34, $helper = value));
    	editors.push({});
    	let contextKey = "editor_" + editors.length;
    	let state = createStateStore(contextKey);
    	component_subscribe($$self, state, value => $$invalidate(4, $state = value));
    	let references = writable({});
    	component_subscribe($$self, references, value => $$invalidate(3, $references = value));
    	set_store_value(state, $state.actionObj = getNewActionObj(defaultActions, actions), $state);

    	let context = {
    		exec: exec$1,
    		getHtml,
    		getText,
    		setHtml,
    		saveRange: saveRange$1,
    		restoreRange: restoreRange$1,
    		helper,
    		references,
    		state,
    		removeFormatTags
    	};

    	setContext(contextKey, context);

    	onMount(() => {
    		set_store_value(state, $state.actionBtns = getActionBtns($state.actionObj), $state);
    		setHtml(html);
    	});

    	function _btnClicked(action) {
    		$references.editor.focus();
    		saveRange$1($references.editor);
    		restoreRange$1($references.editor);
    		action.result.call(context);
    		_handleButtonStatus();
    	}

    	function _handleButtonStatus(clearBtns) {
    		const tags = clearBtns
    		? []
    		: getTagsRecursive(document.getSelection().focusNode);

    		Object.keys($state.actionObj).forEach(action => set_store_value(state, $state.actionObj[action].active = false, $state));
    		tags.forEach(tag => ($state.actionObj[tag.toLowerCase()] || {}).active = true);
    		set_store_value(state, $state.actionBtns = getActionBtns($state.actionObj), $state);
    		state.set($state);
    	}

    	function _onPaste(event) {
    		event.preventDefault();

    		exec$1('insertHTML', event.clipboardData.getData('text/html')
    		? cleanHtml(event.clipboardData.getData('text/html'))
    		: event.clipboardData.getData('text'));
    	}

    	function _onChange(event) {
    		dispatcher('change', event);
    	}

    	function _documentClick(event) {
    		if (!isEditorClick(event.target, $references.editorWrapper) && $helper.blurActive) {
    			dispatcher('blur', event);
    		}

    		set_store_value(helper, $helper.blurActive = true, $helper);
    	}

    	function exec$1(cmd, value) {
    		exec(cmd, value);
    	}

    	function getHtml(sanitize) {
    		return sanitize
    		? removeBadTags($references.editor.innerHTML)
    		: $references.editor.innerHTML;
    	}

    	function getText() {
    		return $references.editor.innerText;
    	}

    	function setHtml(html, sanitize) {
    		const htmlData = sanitize ? removeBadTags(html) : html || '';
    		set_store_value(references, $references.editor.innerHTML = htmlData, $references);
    		set_store_value(references, $references.raw.value = htmlData, $references);
    	}

    	function saveRange$1() {
    		saveRange($references.editor);
    	}

    	function restoreRange$1() {
    		restoreRange($references.editor);
    	}

    	const refs = $references;
    	const click_handler = event => _documentClick(event);
    	const click_handler_1 = (action, event) => _btnClicked(action);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$references.editor = $$value;
    			references.set($references);
    		});
    	}

    	const input_handler = event => _onChange(event.target.innerHTML);
    	const mouseup_handler = () => _handleButtonStatus();
    	const keyup_handler = () => _handleButtonStatus();
    	const paste_handler = event => _onPaste(event);

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$references.raw = $$value;
    			references.set($references);
    		});
    	}

    	function editormodal_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$references.modal = $$value;
    			references.set($references);
    		});
    	}

    	function editorcolorpicker_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$references.colorPicker = $$value;
    			references.set($references);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$references.editorWrapper = $$value;
    			references.set($references);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('actions' in $$props) $$invalidate(13, actions = $$props.actions);
    		if ('height' in $$props) $$invalidate(0, height = $$props.height);
    		if ('html' in $$props) $$invalidate(14, html = $$props.html);
    		if ('contentId' in $$props) $$invalidate(1, contentId = $$props.contentId);
    		if ('colors' in $$props) $$invalidate(2, colors = $$props.colors);
    		if ('removeFormatTags' in $$props) $$invalidate(15, removeFormatTags = $$props.removeFormatTags);
    	};

    	return [
    		height,
    		contentId,
    		colors,
    		$references,
    		$state,
    		helper,
    		state,
    		references,
    		_btnClicked,
    		_handleButtonStatus,
    		_onPaste,
    		_onChange,
    		_documentClick,
    		actions,
    		html,
    		removeFormatTags,
    		exec$1,
    		getHtml,
    		getText,
    		setHtml,
    		saveRange$1,
    		restoreRange$1,
    		refs,
    		click_handler,
    		click_handler_1,
    		div1_binding,
    		input_handler,
    		mouseup_handler,
    		keyup_handler,
    		paste_handler,
    		textarea_binding,
    		editormodal_binding,
    		editorcolorpicker_binding,
    		div2_binding
    	];
    }

    class Editor extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				actions: 13,
    				height: 0,
    				html: 14,
    				contentId: 1,
    				colors: 2,
    				removeFormatTags: 15,
    				exec: 16,
    				getHtml: 17,
    				getText: 18,
    				setHtml: 19,
    				saveRange: 20,
    				restoreRange: 21,
    				refs: 22
    			},
    			add_css,
    			[-1, -1]
    		);
    	}

    	get actions() {
    		return this.$$.ctx[13];
    	}

    	set actions(actions) {
    		this.$$set({ actions });
    		flush();
    	}

    	get height() {
    		return this.$$.ctx[0];
    	}

    	set height(height) {
    		this.$$set({ height });
    		flush();
    	}

    	get html() {
    		return this.$$.ctx[14];
    	}

    	set html(html) {
    		this.$$set({ html });
    		flush();
    	}

    	get contentId() {
    		return this.$$.ctx[1];
    	}

    	set contentId(contentId) {
    		this.$$set({ contentId });
    		flush();
    	}

    	get colors() {
    		return this.$$.ctx[2];
    	}

    	set colors(colors) {
    		this.$$set({ colors });
    		flush();
    	}

    	get removeFormatTags() {
    		return this.$$.ctx[15];
    	}

    	set removeFormatTags(removeFormatTags) {
    		this.$$set({ removeFormatTags });
    		flush();
    	}

    	get exec() {
    		return this.$$.ctx[16];
    	}

    	get getHtml() {
    		return this.$$.ctx[17];
    	}

    	get getText() {
    		return this.$$.ctx[18];
    	}

    	get setHtml() {
    		return this.$$.ctx[19];
    	}

    	get saveRange() {
    		return this.$$.ctx[20];
    	}

    	get restoreRange() {
    		return this.$$.ctx[21];
    	}

    	get refs() {
    		return this.$$.ctx[22];
    	}
    }

    return Editor;

}));
