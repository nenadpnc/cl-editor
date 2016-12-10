import Todo from '../class/todo';

interface IApi{
	createTodo(text: string) : Todo;
	getTodo(id: string) : Todo;
	delteTodo(id: string): number;
	editTodo(id: string, text: string): Todo;

	getAllTodo(): Todo[];
}

export default IApi;