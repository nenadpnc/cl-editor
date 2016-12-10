import * as AV from 'leancloud-storage';

class Todo extends AV.Object{
	text: string;

	constructor(text: string) {
		super();
		this.attributes('text': text);
	}
	
}

AV.Object.register(Todo)

export default Todo;