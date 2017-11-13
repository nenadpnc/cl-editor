import Editor from './Editor.html';

let inlineEditor;
const textWrapper = document.getElementById('textWrapper');
const text = document.getElementById('text');
const inlineEdit = document.getElementById('inlineEdit');
const btn = document.getElementById('editBtn');
btn.addEventListener('click', () => {
	toogleEdit(true);
});

const editor = new Editor({
	target: document.getElementById('editor1')
});

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
				height: '50px',
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