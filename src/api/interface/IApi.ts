import Todo from '../class/todo';
import AV from 'leancloud-storage';

interface IApi{
	createTodo(text: string) : AV.Promise<Todo> | any;
	getTodo(id: string) : AV.Promise<Todo> | any;
	delteTodo(id: string): AV.Promise<Todo> | any;
	editTodo(id: string, text: string): AV.Promise<Todo> | any;

	getAllTodo(): AV.Promise<Todo> | any;
}

export default IApi;