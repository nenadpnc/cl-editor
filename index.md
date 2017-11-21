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
<div id="inlineEdit">
  Edit this line of <b>text</b>
</div>
```

```js
let inlineEditor;
const inlineEdit = document.getElementById('inlineEdit');
inlineEdit.addEventListener('click', showEditor);

function showEditor() {
  let html = inlineEdit.innerHTML;
  inlineEdit.innerHTML = '';
  inlineEditor = new Editor({
    target: inlineEdit,
    data: {
      actions: ['b', 'i', 'u', 'strike', 'removeFormat'],
      height: 'auto',
      html: html
    }
  });

  inlineEdit.removeEventListener('click', showEditor);

  inlineEditor.on('blur', () => {
    html = inlineEditor.getHtml();
    inlineEditor.destroy();
    inlineEdit.innerHTML = html;
    inlineEdit.addEventListener('click', showEditor);
  });
}
```
<br>
<div>
  <div id="inlineEdit">
    Edit this line of <b>text</b>
  </div>
</div>

<br>
<br>
<br>
<br>
