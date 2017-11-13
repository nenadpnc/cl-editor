import Editor from './Editor.html';

const editor = new Editor({
	target: document.querySelector('#clEditor'),
	data: {
		actions: [],
		html: '<ul><li>test</li></ul>',
		height: '200px'
	}
});

const editor2 = new Editor({
	target: document.querySelector('#clEditor2'),
	data: {
		actions: [],
		html: '<ul><li>test</li></ul>',
		height: '200px'
	}
});