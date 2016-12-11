import AV from 'leancloud-storage';

class Todo extends AV.Object{
	text: string;

	constructor(id?: string, text?: string) {
		super();
		id && (this.id = id);
		text && (this.set('text', text));

		this.set('status', 'default');
		
	}
	
}

AV.Object.register(Todo)

export default Todo;