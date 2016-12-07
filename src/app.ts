import App from './pages/App.html';
import store from "./store/index";
import * as _ from 'lodash';


const app = new App({
	target: document.querySelector('application'),
	data: store
})

let observe = app.observe('name', (newValue, oldValue) => {
	console.log(newValue + " " + oldValue);
}, { init : false })

let on = app.on('eat', (event) => {
	console.log("eat " + event.name);
})

app.fire('eat', {
	name: "apple"
})

app.set({name: "i \'m new value"});

console.log(on);
console.log(observe);

console.log(store);
