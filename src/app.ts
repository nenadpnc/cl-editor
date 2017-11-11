import Editor from './Editor.html';

const editor = new Editor({
	target: document.querySelector('#clEditor'),
	data: {
		actions: [],
		html: '<ul><li>test</li></ul>'
	}
});