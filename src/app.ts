import Editor from './Editor.html';

let inlineEditor;
const inlineEdit = document.getElementById('inlineEdit');
inlineEdit.addEventListener('click', showEditor);

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

function showEditor() {
	let html = inlineEdit.innerHTML;
	inlineEdit.innerHTML = '';
	inlineEditor = new Editor({
		target: inlineEdit,
		data: {
			actions: ['b', 'i', 'u', 'strike', 'removeFormat'],
			height: '42px',
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