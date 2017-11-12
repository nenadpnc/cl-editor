let t: any = {};

export const exec = (command: string, value = null) => {
  document.execCommand(command, false, value)
}

export const getTagsRecursive = (element: HTMLElement | any, tags: string[]) => {
  tags = tags || (element && element.tagName ? [element.tagName] : []);

  if (element && element.parentNode) {
    element = element.parentNode;
  } else {
    return tags;
  }

  const tag = element.tagName;
  if (element.style && element.getAttribute) {
    [element.style.textAlign || element.getAttribute('align'), element.style.color || tag === 'FONT' && 'forecolor', element.style.backgroundColor && 'backcolor']
      .filter((item: string) => item)
      .forEach((item: string) => tags.push(item));
  }

  if (tag === 'DIV') {
    return tags;
  }

  tags.push(tag);

  return getTagsRecursive(element, tags).filter((_tag) => _tag != null);
}

export const saveRange = (editor: HTMLElement) => {
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
export const restoreRange = (editor: HTMLElement) => {
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

export const cleanHtml = (input: string) => {
    // remove line brakers and find relevant html
    const html = input.replace(/\r?\n|\r/g, ' ').match(/<!--StartFragment-->(.*?)<!--EndFragment-->/);
    let output = html && html[1] || '';
    output = output
                // 1. removeMso classes
                .replace(/(class=(")?Mso[a-zA-Z]+(")?)/g, ' ')
                // 2. strip Word generated HTML comments
                .replace(/<!--(.*?)-->/g, '')
                // 3. remove tags leave content if any
                .replace(new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>','gi'), '')
                .replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi, '')
                .replace(/style="[^"]*"/gi, '')
                .replace(/style='[^']*'/gi, '')
                .replace(/&nbsp;/gi, ' ');
                        
    // 4. Remove everything in between and including tags '<style(.)style(.)>'
    output = removeBadTags(output);
    return output;
}

export const unwrap = (wrapper: HTMLElement) => {
	const docFrag = document.createDocumentFragment();
	while (wrapper.firstChild) {
		const child = wrapper.removeChild(wrapper.firstChild);
		docFrag.appendChild(child);
	}

	// replace wrapper with document fragment
	wrapper.parentNode.replaceChild(docFrag, wrapper);
}

export const removeBlockTagsRecursive = (elements: HTMLCollection) => {
  Array.from(elements).forEach((item: HTMLElement) => {
    if (['h1', 'h2', 'p', 'div', 'blockquote'].some((tag) => tag === item.tagName.toLowerCase())) {
      if (item.children.length) {
        removeBlockTagsRecursive(item.children);
      }
      unwrap(item);
    }
  });
}

export const getActionBtns = (actions) => {
  return Object.keys(actions).map((action) => actions[action]);
}

export const getNewActionObj = (actions: any, userActions = []) => {
    if (userActions && userActions.length) {
        const newActions = {};
        userActions.forEach((action) => {
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
}

export const removeBadTags = (html: string) => {
    ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'].forEach((badTag) => {
        html = html.replace(new RegExp(`<${badTag}.*?${badTag}(.*?)>`, 'gi'), '')
    });

    return html;
}

export const isEditorClick = (target: HTMLElement, editorWrapper: HTMLElement) => {
    if (target === editorWrapper) {
        return true;
    }
    if (target.parentElement) {
        return isEditorClick(target.parentElement, editorWrapper);
    }
    return false;
}