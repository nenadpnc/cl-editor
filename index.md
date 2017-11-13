---
layout: default
---

## [](#header-2)Basic Example

Includes all available actions and default height.

```js
const editor = new Editor({
    target: document.getElementById('editor1')
})
```
<div id="editor1"></div>
<br>
<br>

## [](#header-2)Custom action example

Example of custom _**copy**_ action.

```js
const editor2 = new Editor({
    target: document.getElementById('editor2'),
    data: {
      actions: [
        'b', 'i', 'u', 'strike', 'h1', 'h2', 'p',
        {
            name: 'copy', 
            icon: '&#128203;',
            title: 'Copy',
            result: () => {
              const selection = window.getSelection();
              if (!selection.toString().length) {
                const range = document.createRange();
                range.selectNodeContents(editor2.refs.editor);
                selection.removeAllRanges();
                selection.addRange(range);
              }
              editor2.exec('copy');
            }
        }
      ],
      html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a odio neque. Duis ac laoreet lacus.',
	    height: '150px'
    }
})
```

<div id="editor2"></div>
<br>
<br>

## [](#header-2)Example using _**blur**_ event

You can use editor _blur_ event to inline edit text.

```html
<div>
    <div id="textWrapper">
        <span id="text">Edit this line of <b>text</b></span>
        <a id="editBtn">&#128393;</a>
    </div>
    <div id="inlineEdit" style="display: none"></div>
</div>
```

```js
let inlineEditor;
const textWrapper = document.getElementById('textWrapper');
const text = document.getElementById('text');
const inlineEdit = document.getElementById('inlineEdit');
const btn = document.getElementById('editBtn');

btn.addEventListener('click', () => {
	toogleEdit(true);
});

const toogleEdit = (showEditor?: boolean) => {
	textWrapper.style.display = showEditor ? 'none' : 'block';
	inlineEdit.style.display = showEditor ? 'block' : 'none';
	if (showEditor) {
		let init = false;
		inlineEditor = new Editor({
			target: inlineEdit,
			data: {
				actions: ['b', 'i', 'u', 'strike', 'removeFormat'],
				height: '42px',
				html: text.innerHTML
			}
		});

		inlineEditor.on('blur', () => {
			if (init) {
				text.innerHTML = inlineEditor.getHtml();
				inlineEditor.destroy();
				toogleEdit();
			}
			init = true;
		});
	} else {
		inlineEditor.destroy();
	}
}
```
<br>
<div>
    <div id="textWrapper">
        <span id="text">Edit this line of <b>text</b></span>
        <a id="editBtn">&#128393;</a>
    </div>
    <div id="inlineEdit" style="display: none"></div>
</div>

<br>
<br>
<br>
<br>
