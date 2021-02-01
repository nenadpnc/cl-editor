let t = {};

export const exec = (command, value = null) => {
  document.execCommand(command, false, value)
}

export const getTagsRecursive = (element, tags) => {
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
}

export const saveRange = (editor) => {
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
}
export const restoreRange = (editor) => {
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
}

export const cleanHtml = (input) => {
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
    .trim()

    output = removeBadTags(output);
    return output;
}

export const unwrap = (wrapper) => {
	const docFrag = document.createDocumentFragment();
	while (wrapper.firstChild) {
		const child = wrapper.removeChild(wrapper.firstChild);
		docFrag.appendChild(child);
	}

	// replace wrapper with document fragment
	wrapper.parentNode.replaceChild(docFrag, wrapper);
}

export const removeBlockTagsRecursive = (elements, tagsToRemove) => {
  Array.from(elements).forEach((item) => {
    if (tagsToRemove.some((tag) => tag === item.tagName.toLowerCase())) {
      if (item.children.length) {
        removeBlockTagsRecursive(item.children, tagsToRemove);
      }
      unwrap(item);
    }
  });
}

export const getActionBtns = (actions) => {
  return Object.keys(actions).map((action) => actions[action]);
}

export const getNewActionObj = (actions, userActions = []) => {
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
}

export const removeBadTags = (html) => {
  ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'].forEach((badTag) => {
    html = html.replace(new RegExp(`<${badTag}.*?${badTag}(.*?)>`, 'gi'), '')
  });

  return html;
}

export const isEditorClick = (target, editorWrapper) => {
  if (target === editorWrapper) {
    return true;
  }
  if (target.parentElement) {
    return isEditorClick(target.parentElement, editorWrapper);
  }
  return false;
}
