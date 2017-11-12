import Editor from './Editor.html';

const editor = new Editor({
	target: document.querySelector('#clEditor'),
	data: {
		actions: [],
		html: '<ul><li>test</li></ul>',
		height: '100px'
	}
});

const editor2 = new Editor({
	target: document.getElementById('editor2'),
	data: {
		height: '100px'
	}
})