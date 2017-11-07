(function () {
'use strict';

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d();
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) this._fragment.u();
	this._fragment.d();
	this._fragment = this._state = null;
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component.options = options;

	component._observers = { pre: blankObject(), post: blankObject() };
	component._handlers = blankObject();
	component._root = options._root || component;
	component._bind = options._bind;
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this._root._lock) return;
	this._root._lock = true;
	callAll(this._root._beforecreate);
	callAll(this._root._oncreate);
	callAll(this._root._aftercreate);
	this._root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);
	dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
	this._fragment.p(changed, this._state);
	dispatchObservers(this, this._observers.post, changed, this._state, oldState);
}

function callAll(fns) {
	while (fns && fns.length) fns.pop()();
}

function _mount(target, anchor) {
	this._fragment.m(target, anchor);
}

function _unmount() {
	this._fragment.u();
}

var proto = {
	destroy: destroy,
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	teardown: destroy,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount
};

var t = {};
var exec = function exec(command) {
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
    [element.style.textAlign || element.getAttribute('align'), element.style.color || tag === 'FONT' && 'forecolor', element.style.backgroundColor && 'backcolor'].filter(function (item) {
        return item;
    }).forEach(function (item) {
        return tags.push(item);
    });
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
    // remove line brakers and find relevant html
    var html = input.replace(/\r?\n|\r/g, ' ').match(/<!--StartFragment-->(.*?)<!--EndFragment-->/);
    var output = html && html[1] || '';
    output = output.replace(/(class=(")?Mso[a-zA-Z]+(")?)/g, ' ').replace(/<!--(.*?)-->/g, '').replace(new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>', 'gi'), '').replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi, '').replace(/style="[^"]*"/gi, '').replace(/style='[^']*'/gi, '').replace(/&nbsp;/gi, ' ');
    // 4. Remove everything in between and including tags '<style(.)style(.)>'
    ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'].forEach(function (badTag) {
        output = output.replace(new RegExp('<' + badTag + '.*?' + badTag + '(.*?)>', 'gi'), '');
    });
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
var removeBlockTagsRecursive = function removeBlockTagsRecursive(elements) {
    Array.from(elements).forEach(function (item) {
        if (['h1', 'h2', 'p', 'div', 'blockquote'].some(function (tag) {
            return tag === item.tagName.toLowerCase();
        })) {
            if (item.children.length) {
                removeBlockTagsRecursive(item.children);
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
                newActions[action] = actions[action];
            } else if (actions[action.name]) {
                newActions[action.name] = Object.assign(actions[action.name], action);
            } else {
                newActions[action.name] = action;
            }
        });
        return newActions;
    } else {
        return actions;
    }
};

var showEditor = true;
var actions = {
    viewHtml: {
        icon: '<svg id="trumbowyg-view-html" viewBox="0 0 72 72" width="17px" height="100%"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"></path></svg>',
        title: 'View HTML',
        result: function result() {
            var _this = this;

            var actionObj = this.get('actionObj');
            showEditor = !showEditor;
            this.refs.editor.style.display = showEditor ? 'block' : 'none';
            this.refs.raw.style.display = showEditor ? 'none' : 'block';
            if (showEditor) {
                this.refs.editor.innerHTML = this.refs.raw.value;
            } else {
                this.refs.raw.value = this.refs.editor.innerHTML;
            }
            setTimeout(function () {
                Object.keys(actionObj).forEach(function (action) {
                    return actionObj[action].disabled = !showEditor;
                });
                actionObj.viewHtml.disabled = false;
                actionObj.viewHtml.active = !showEditor;
                _this.set({ actionBtns: getActionBtns(actionObj), actionObj: actionObj });
            });
        }
    },
    undo: {
        icon: '<svg id="trumbowyg-undo" viewBox="0 0 72 72" width="17px" height="100%"><path d="M61.2 51.2c0-5.1-2.1-9.7-5.4-13.1-3.3-3.3-8-5.4-13.1-5.4H26.1v-12L10.8 36l15.3 15.3V39.1h16.7c3.3 0 6.4 1.3 8.5 3.5 2.2 2.2 3.5 5.2 3.5 8.5h6.4z"></path></svg>',
        title: 'Undo',
        result: function result() {
            return exec('undo');
        }
    },
    redo: {
        icon: '<svg id="trumbowyg-redo" viewBox="0 0 72 72" width="17px" height="100%"><path d="M10.8 51.2c0-5.1 2.1-9.7 5.4-13.1 3.3-3.3 8-5.4 13.1-5.4H46v-12L61.3 36 45.9 51.3V39.1H29.3c-3.3 0-6.4 1.3-8.5 3.5-2.2 2.2-3.5 5.2-3.5 8.5h-6.5z"></path></svg>',
        title: 'Redo',
        result: function result() {
            return exec('redo');
        }
    },
    b: {
        icon: '<b>B</b>',
        title: 'Bold',
        result: function result() {
            return exec('bold');
        }
    },
    i: {
        icon: '<i>I</i>',
        title: 'Italic',
        result: function result() {
            return exec('italic');
        }
    },
    u: {
        icon: '<u>U</u>',
        title: 'Underline',
        result: function result() {
            return exec('underline');
        }
    },
    strike: {
        icon: '<strike>S</strike>',
        title: 'Strike-through',
        result: function result() {
            return exec('strikeThrough');
        }
    },
    h1: {
        icon: '<b>H<sub>1</sub></b>',
        title: 'Heading 1',
        result: function result() {
            return exec('formatBlock', '<H1>');
        }
    },
    h2: {
        icon: '<b>H<sub>2</sub></b>',
        title: 'Heading 2',
        result: function result() {
            return exec('formatBlock', '<H2>');
        }
    },
    p: {
        icon: '&#182;',
        title: 'Paragraph',
        result: function result() {
            return exec('formatBlock', '<P>');
        }
    },
    blockquote: {
        icon: '&#8220; &#8221;',
        title: 'Quote',
        result: function result() {
            return exec('formatBlock', '<BLOCKQUOTE>');
        }
    },
    ol: {
        icon: '<svg id="trumbowyg-ordered-list" viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"></path></svg>',
        title: 'Ordered List',
        result: function result() {
            return exec('insertOrderedList');
        }
    },
    ul: {
        icon: '<svg id="trumbowyg-unordered-list" viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"></path></svg>',
        title: 'Unordered List',
        result: function result() {
            return exec('insertUnorderedList');
        }
    },
    line: {
        icon: '&#8213;',
        title: 'Horizontal Line',
        result: function result() {
            return exec('insertHorizontalRule');
        }
    },
    left: {
        icon: '<svg id="trumbowyg-justify-left" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h36v8H9z"></path></svg>',
        title: 'Justify left',
        result: function result() {
            return exec('justifyLeft');
        }
    },
    right: {
        icon: '<svg id="trumbowyg-justify-right" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM27 32h36v8H27z"></path></svg>',
        title: 'Justify right',
        result: function result() {
            return exec('justifyRight');
        }
    },
    center: {
        icon: '<svg id="trumbowyg-justify-center" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM18 32h36v8H18z"></path></svg>',
        title: 'Justify center',
        result: function result() {
            return exec('justifyCenter');
        }
    },
    justify: {
        icon: '<svg id="trumbowyg-justify-full" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h54v8H9z"></path></svg>',
        title: 'Justify full',
        result: function result() {
            return exec('justifyFull');
        }
    },
    a: {
        icon: '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>',
        title: 'Insert link',
        result: function result() {
            var actionObj = this.get('actionObj');
            if (actionObj.a.active) {
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(document.getSelection().focusNode);
                selection.removeAllRanges();
                selection.addRange(range);
                exec('unlink');
                actionObj.a.title = 'Insert link';
                actionObj.a.icon = '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>';
            } else {
                var url = window.prompt('Enter the link URL');
                if (url) {
                    exec('createLink', url);
                    actionObj.a.title = 'Unlink';
                    actionObj.a.icon = '<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"></path><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"></path></svg>';
                }
            }
            this.set({ actionBtns: getActionBtns(actionObj), actionObj: actionObj });
        }
    },
    image: {
        icon: '<svg id="trumbowyg-insert-image" viewBox="0 0 72 72" width="17px" height="100%"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"></path><path d="M17.5 22C15 22 13 24 13 26.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zM16 50h27L29.5 32zM36 36.2l8.9-8.5L60.2 50H45.9S35.6 35.9 36 36.2z"></path></svg>',
        title: 'Image',
        result: function result() {
            var url = window.prompt('Enter the image URL');
            if (url) exec('insertImage', url);
        }
    },
    forecolor: {
        icon: '<svg id="trumbowyg-fore-color" viewBox="0 0 72 72" width="17px" height="100%"><path d="M32 15h7.8L56 57.1h-7.9l-4-11.1H27.4l-4 11.1h-7.6L32 15zm-2.5 25.4h12.9L36 22.3h-.2l-6.3 18.1z"></path></svg>',
        title: 'Text color',
        result: function result() {
            var color = window.prompt('enter color');
            exec('foreColor', color);
        }
    },
    backcolor: {
        icon: '<svg id="trumbowyg-back-color" viewBox="0 0 72 72" width="17px" height="100%"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"></path><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"></path></svg>',
        title: 'Background color',
        result: function result() {
            var color = window.prompt('enter background color');
            exec('backColor', color);
        }
    },
    removeFromat: {
        icon: '<svg id="trumbowyg-removeformat" viewBox="0 0 72 72" width="17px" height="100%"><path d="M58.2 54.6L52 48.5l3.6-3.6 6.1 6.1 6.4-6.4 3.8 3.8-6.4 6.4 6.1 6.1-3.6 3.6-6.1-6.1-6.4 6.4-3.7-3.8 6.4-6.4zM21.7 52.1H50V57H21.7zM18.8 15.2h34.1v6.4H39.5v24.2h-7.4V21.5H18.8v-6.3z"></path></svg>',
        title: 'Remove format',
        result: function result() {
            var selection = window.getSelection();
            if (!selection.toString().length) {
                removeBlockTagsRecursive(this.refs.editor.children);
                var range = document.createRange();
                range.selectNodeContents(this.refs.editor);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            exec('removeFormat');
            selection.removeAllRanges();
        }
    }
};

/* src\Editor.html generated by Svelte v1.41.2 */
function data() {
	return {
		actionBtns: [],
		height: '300px'
	};
}

var methods = {
	btnClicked: function btnClicked(action) {
		saveRange(this.refs.editor);
		restoreRange(this.refs.editor);
		action.result.call(this);
		this.handleButtonStatus();
	},
	handleButtonStatus: function handleButtonStatus() {
		var tags = getTagsRecursive(document.getSelection().focusNode);
		var actionObj = this.get('actionObj');
		Object.keys(actionObj).forEach(function (action) {
			return actionObj[action].active = false;
		});
		tags.forEach(function (tag) {
			return (actionObj[tag.toLowerCase()] || {}).active = true;
		});
		this.set({ actionBtns: getActionBtns(actionObj), actionObj: actionObj });
	},
	onPaste: function onPaste(event) {
		event.preventDefault();
		exec('insertHTML', cleanHtml(event.clipboardData.getData('text/html')));
	},
	onChange: function onChange(html) {
		this.fire('onChange', html);
	}
};

function oncreate() {
	var actionObj = getNewActionObj(actions, this.options.data && this.options.data.actions);
	this.set({ actionBtns: getActionBtns(actionObj), actionObj: actionObj });
}

function encapsulateStyles(node) {
	setAttribute(node, "svelte-4231003605", "");
}

function add_css() {
	var style = createElement("style");
	style.id = 'svelte-4231003605-style';
	style.textContent = "[svelte-4231003605].cl,[svelte-4231003605] .cl{box-shadow:0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);box-sizing:border-box;width:100%}[svelte-4231003605].cl-content,[svelte-4231003605] .cl-content{box-sizing:border-box;height:300px;outline:0;overflow-y:auto;padding:10px;width:100%}[svelte-4231003605].cl-actionbar,[svelte-4231003605] .cl-actionbar{background-color:#ecf0f1;border-bottom:1px solid rgba(10, 10, 10, 0.1);width:100%}[svelte-4231003605].cl-button,[svelte-4231003605] .cl-button{background-color:transparent;border:none;cursor:pointer;height:35px;outline:0;width:35px;vertical-align:top}[svelte-4231003605].cl-button:hover,[svelte-4231003605] .cl-button:hover,[svelte-4231003605].cl-button.active,[svelte-4231003605] .cl-button.active{background-color:#fff}[svelte-4231003605].cl-button:disabled,[svelte-4231003605] .cl-button:disabled{opacity:.5;pointer-events:none}[svelte-4231003605].cl-textarea,[svelte-4231003605] .cl-textarea{display:none;width:100%;max-width:100%;border:none;padding:10px;box-sizing:border-box}[svelte-4231003605].cl-textarea:focus,[svelte-4231003605] .cl-textarea:focus{outline:none}";
	appendNode(style, document.head);
}

function create_main_fragment(state, component) {
	var div, div_1, text_1, div_2, text_2, textarea;

	var actionBtns = state.actionBtns;

	var each_blocks = [];

	for (var i = 0; i < actionBtns.length; i += 1) {
		each_blocks[i] = create_each_block(state, actionBtns, actionBtns[i], i, component);
	}

	function input_handler(event) {
		component.onChange(event.target.innerHTML);
	}

	function mouseup_handler(event) {
		component.handleButtonStatus();
	}

	function keyup_handler(event) {
		component.handleButtonStatus();
	}

	function paste_handler(event) {
		component.onPaste(event);
	}

	return {
		c: function create() {
			div = createElement("div");
			div_1 = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_1 = createText("\r\n    ");
			div_2 = createElement("div");
			text_2 = createText("\r\n    \r\n    ");
			textarea = createElement("textarea");
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div.className = "cl";
			div_1.className = "cl-actionbar";
			div_2.className = "cl-content";
			setStyle(div_2, "height", state.height);
			div_2.contentEditable = "true";
			addListener(div_2, "input", input_handler);
			addListener(div_2, "mouseup", mouseup_handler);
			addListener(div_2, "keyup", keyup_handler);
			addListener(div_2, "paste", paste_handler);
			textarea.className = "cl-textarea";
			setStyle(textarea, "height", state.height);
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(div_1, div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div_1, null);
			}

			appendNode(text_1, div);
			appendNode(div_2, div);
			component.refs.editor = div_2;
			appendNode(text_2, div);
			appendNode(textarea, div);
			component.refs.raw = textarea;
		},

		p: function update(changed, state) {
			var actionBtns = state.actionBtns;

			if (changed.actionBtns) {
				for (var i = 0; i < actionBtns.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, actionBtns, actionBtns[i], i);
					} else {
						each_blocks[i] = create_each_block(state, actionBtns, actionBtns[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(div_1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = actionBtns.length;
			}

			if (changed.height) {
				setStyle(div_2, "height", state.height);
				setStyle(textarea, "height", state.height);
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(div_2, "input", input_handler);
			removeListener(div_2, "mouseup", mouseup_handler);
			removeListener(div_2, "keyup", keyup_handler);
			removeListener(div_2, "paste", paste_handler);
			if (component.refs.editor === div_2) component.refs.editor = null;
			if (component.refs.raw === textarea) component.refs.raw = null;
		}
	};
}

// (3:6) {{#each actionBtns as action}}
function create_each_block(state, actionBtns, action, action_index, component) {
	var button,
	    button_class_value,
	    button_title_value,
	    button_disabled_value,
	    raw_value = action.icon;

	return {
		c: function create() {
			button = createElement("button");
			this.h();
		},

		h: function hydrate() {
			button.className = button_class_value = "cl-button " + (action.active ? 'active' : '');
			button.title = button_title_value = action.title;
			button.disabled = button_disabled_value = action.disabled;
			addListener(button, "click", click_handler);

			button._svelte = {
				component: component,
				actionBtns: actionBtns,
				action_index: action_index
			};
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			button.innerHTML = raw_value;
		},

		p: function update(changed, state, actionBtns, action, action_index) {
			if (changed.actionBtns && button_class_value !== (button_class_value = "cl-button " + (action.active ? 'active' : ''))) {
				button.className = button_class_value;
			}

			if (changed.actionBtns && button_title_value !== (button_title_value = action.title)) {
				button.title = button_title_value;
			}

			if (changed.actionBtns && button_disabled_value !== (button_disabled_value = action.disabled)) {
				button.disabled = button_disabled_value;
			}

			button._svelte.actionBtns = actionBtns;
			button._svelte.action_index = action_index;

			if (changed.actionBtns && raw_value !== (raw_value = action.icon)) {
				button.innerHTML = raw_value;
			}
		},

		u: function unmount() {
			button.innerHTML = '';

			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

function click_handler(event) {
	var component = this._svelte.component;
	var actionBtns = this._svelte.actionBtns,
	    action_index = this._svelte.action_index,
	    action = actionBtns[action_index];
	component.btnClicked(action);
}

function Editor(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);

	if (!document.getElementById("svelte-4231003605-style")) add_css();

	var _oncreate = oncreate.bind(this);

	if (!options._root) {
		this._oncreate = [_oncreate];
	} else {
		this._root._oncreate.push(_oncreate);
	}

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._oncreate);
	}
}

assign(Editor.prototype, methods, proto);

var editor = new Editor({
    target: document.querySelector('#clEditor')
});

}());
//# sourceMappingURL=index.js.map
