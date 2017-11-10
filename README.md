## Lightweight text editor

typescript + svelte (no external dependencies) 

#### File size (bundle includes css, html and js)
* min: 29kb
* gzip: 9kb

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

#### Usage
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
    data: {
        // <Array[string | Object]> string if overwriting, object if customizing/creating
        // available actions:
        // 'viewHtml', 'undo', 'redo', 'b', 'i', 'u', 'strike', 'h1', 'h2', 'p', 'blockquote', 
        // 'ol', 'ul', 'hr', 'left', 'right', 'center', 'justify', 'a', 'image', 'forecolor', 'backcolor', 'removeFormat'
        actions: [
            'b', 'i', 'u', 'strike', 'ul', 'ol',
            {
                name: 'copy', // required
                icon: '<b>C</b>', // string or html string (ex. <svg>...</svg>)
                title: 'Copy',
                result: () => console.log('copy')
            },
            'h1', 'h2', 'p'
        ],
        // default 300px
        height: '300px',
        // initial html
        html: ''
    }
})
```

#### API
```js
// Methods
editor.exec(cmd, value) // execute document command (document.executeCommand(cmd, false, value))
editor.getHtml(sanitize?: boolean) // returns html string from editor. if passed true as argument, html will be sanitized before return
editor.getText() // returns text string from editor
editor.setHtml(html, sanitize?: boolean) // sets html for editor. if second argument is true, html will be sanitized
```
* There are also built in svelte methods like get, set, observe, fire, destroy.
* You can check them out at [https://svelte.technology/guide](https://svelte.technology/guide)
```js
// Events
editor.on('change', (html) => console.log(html)) // on every keyup event
editor.on('blur', (event) => console.log(event)) // on editor blur event
```
```js
// Props
editor.refs.<editor | raw | modal | colorPicker> // references to editor, raw (textarea), modal and colorPicker HTMLElements
editor.options // current editor options
```

#### Run demo
```bash
git clone https://github.com/nenadpnc/cl-text-editor.git cl-editor
cd cl-editor
npm i
npm run dev:w
```

#### This library is inspired by https://github.com/Alex-D/Trumbowyg and https://github.com/jaredreich/pell

## Licence

 MIT License
