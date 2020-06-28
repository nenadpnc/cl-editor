import Editor from './Editor.svelte';

let inlineEditor;
const inlineEdit = document.getElementById('inlineEdit');
inlineEdit.addEventListener('click', showEditor);

const editor = new Editor({
	target: document.getElementById('editor1')
});

const editor2 = new Editor({
    target: document.getElementById('editor2'),
    props: {
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

editor2.$on('change', (event) => {
	console.log(event.detail);
})

function showEditor() {
	let html = inlineEdit.innerHTML;
	inlineEdit.innerHTML = '';
	inlineEditor = new Editor({
		target: inlineEdit,
		props: {
			actions: ['b', 'i', 'u', 'strike', 'removeFormat'],
			height: 'auto',
			html: html
		}
	});

	inlineEdit.removeEventListener('click', showEditor);

	inlineEditor.$on('blur', () => {
		html = inlineEditor.getHtml();
		inlineEditor.$destroy();
		inlineEdit.innerHTML = html;
		inlineEdit.addEventListener('click', showEditor);
	});
}
