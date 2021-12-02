## Lightweight text editor

Built with svelte (no external dependencies) 

#### File size (bundle includes css, html and js)
* min: 30kb
* gzip: 10kb

## Installation

#### npm:

```bash
npm install --save cl-editor
```

#### HTML:

```html
<head>
  ...
</head>
<body>
  ...
  <div id="editor"></div>
  ...
</body>
```

## Usage
```js
import Editor from 'cl-editor';
// or
const Editor = require('cl-editor');
```
```js
// Initialize editor
const editor = new Editor({
    // <HTMLElement> required
    target: document.getElementById('editor'),
    // optional
    props: {
        // <Array[string | Object]> string if overwriting, object if customizing/creating
        // available actions:
        // 'viewHtml', 'undo', 'redo', 'b', 'i', 'u', 'strike', 'sup', 'sub', 'h1', 'h2', 'p', 'blockquote', 
        // 'ol', 'ul', 'hr', 'left', 'right', 'center', 'justify', 'a', 'image', 'forecolor', 'backcolor', 'removeFormat'
        actions: [
            'b', 'i', 'u', 'strike', 'ul', 'ol',
            {
                name: 'copy', // required
                icon: '<b>C</b>', // string or html string (ex. <svg>...</svg>)
                title: 'Copy',
                result: () => {
                    // copy current selection or whole editor content
                    const selection = window.getSelection();
                    if (!selection.toString().length) {
                        const range = document.createRange();
                        range.selectNodeContents(editor.refs.editor);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    editor.exec('copy');
                }
            },
            'h1', 'h2', 'p'
        ],
        // default 300px
        height: '300px',
        // initial html
        html: '',
        // remove format action clears formatting, but also removes some html tags.
        // you can specify which tags you want to be removed.
        removeFormatTags: ['h1', 'h2', 'blackquote'] // default
    }
})
```

### API
```js
// Methods
editor.exec(cmd: string, value?: string) // execute document command (document.executeCommand(cmd, false, value))
editor.getHtml(sanitize?: boolean) // returns html string from editor. if passed true as argument, html will be sanitized before return
editor.getText() // returns text string from editor
editor.setHtml(html: string, sanitize?: boolean) // sets html for editor. if second argument is true, html will be sanitized
editor.saveRange() // saves current editor cursor position or user selection
editor.restoreRange() // restores cursor position or user selection
// saveRange and restoreRange are useful when making custom actions
// that demands that focus is shifted from editor to, for example, modal window.
```
* For list of available _**exec**_ command visit [https://codepen.io/netsi1964/pen/QbLLG](https://codepen.io/netsi1964/pen/QbLLGW)
```js
// Events
editor.$on('change', (event) => console.log(event)) // on every keyup event
editor.$on('blur', (event) => console.log(event)) // on editor blur event
```
```js
// Props
editor.refs.<editor | raw | modal | colorPicker> // references to editor, raw (textarea), modal and colorPicker HTMLElements
```

#### Actions

The `actions` prop lists predefined actions (and/or adds new actions) to be shown in the toolbar.
If the prop is not set, all `actions` defined and exported in [actions.js](src/helpers/actions.js) are made available, in the order in which they are defined.
To limit or change the order of predefined actions shown, set it by passing an array of names of actions defined, eg.:
```js
actions={["b", "i", "u", "h2", "ul", "left", "center", "justify", "forecolor"]}
```
The editor looks up to see if name is already defined, and adds it to the toolbar if it is.

You can add a custom action by inserting it in the array, like how "copy" is defined in example above. Take a look at `actions.js` for more examples.


### Usage in Svelte

It is easier to import and work directly from the source if you are using Svelte. You can handle `change` events via `on:change`.

```jsx
<script>
  import Editor from "cl-editor/src/Editor.svelte"

  let html = '<h3>hello</h3>'
  let editor

</script>

{@html html}
<Editor {html} on:change={(evt)=>html = evt.detail}/>
```

### Example of customising the color picker palette 

```jsx
<script>
  import Editor from "cl-editor/src/Editor.svelte"

  let html = '<h3>hello</h3>'
  let colors = ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
        '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
        '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
        '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
        '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466']
  let editor

</script>

{@html html}
<Editor {html} {colors} on:change={(evt)=>html = evt.detail}/>
```

To limit or define the tools shown in the toolbar, pass in an `actions` prop.

To easily get the editor content DOM element, pass an `contentId` prop, eg. `contentId='notes-content'`.

This is useful if you want to listen to resize of the editor and respond accordingly.

To do so, first enable resize on the editor:

```css
.cl-content {
  resize: both;
}
```

Now observe the resize:

```jsx
<script>
  const ro = new ResizeObserver(entries => {
    const contentWd = entries[0].contentRect.width
    // respond to contentWd ...
  })
  let editor
  $: editor && ro.observe(document.getElementById('notes-content'))
</script>

<Editor {...otherEditorCfgs} contentId='notes-content' bind:this={editor} />
```

### Run demo
```bash
git clone https://github.com/nenadpnc/cl-text-editor.git cl-editor
cd cl-editor
npm i
npm run dev
```

## References
This library is inspired by these open source repos:
- [Alex-D/Trumbowyg](https://github.com/Alex-D/Trumbowyg)
- [jaredreich/pell](https://github.com/jaredreich/pell)

## Licence

MIT License
