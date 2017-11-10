import Editor from './Editor.html';

const editor = new Editor({
	target: document.querySelector('#clEditor'),
	data: {
		actions: ['viewHtml', 'undo', 'redo', 'b', 'i', 'u', 'strike', 'ol', 'ul', 'forecolor', 'backcolor', 'line', 'removeFormat'],
		html: '<ul><li>test</li></ul>'
	}
});
