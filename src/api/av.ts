import config  from './config';
import AV from 'leancloud-storage';
import IApi from './interface/IApi';
import Todo from './class/Todo';

class API implements IApi{
	constructor(){
		AV.init({
			appId: config.AV.appId,
			appKey: config.AV.appKey
		});
	}
	createTodo(text: string) : AV.Promise<Todo> {
		const todo = new Todo(null, text);
		return todo.save();
	}

	getTodo(id: string) : AV.Promise<Todo>{
		let todo = new Todo(id);
		return todo.fetch();
	}

	delteTodo(id: string): AV.Promise<Todo>{
		let todo = new Todo(id);
		return todo.destroy()
	}

	editTodo(id: string, text: string): AV.Promise<Todo>{
		let todo = new Todo(id, text);
		return todo.save()
	}

	getAllTodo(): AV.Promise<Todo[]> {
		var q = new AV.Query(Todo);
		q.descending('createdAt');
		return  q.find();
	}

}

export default API;