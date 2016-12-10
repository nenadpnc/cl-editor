import App from './App.html';
import store from "./store";

import './asset/stylus/app.styl';


const app = new App({
	target: document.querySelector('application'),
	data: store
})
