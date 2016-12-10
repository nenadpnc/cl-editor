import config  from './config';
import * as AV from 'leancloud-storage';
import IApi from './interface/IApi';
import Todo from './class/Todo';

class API implements IApi{
	static instance: any;
	static getInstace() {
		if(this.instance) {
			return this.instance;
		}
		this.instance = new API();
		return this.instance;
	}

	private constructor() {
		AV.init({
			appId: config.AV.appId,
			appKey: config.AV.appKey
		});
	}

	createTodo(text: string) : Todo {
		const todo = new Todo();
		todo.save();
		return todo;
	}

	getTodo(id: string) : Todo{

	}

	delteTodo(id: string): number{

	}

	editTodo(id: string, text: string): Todo{

	}

	getAllTodo(): Todo[] {

	}


}

export default API;