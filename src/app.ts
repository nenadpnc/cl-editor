import App from './App.html';
import store from "./store";

import './assets/scss/app.scss';

const app = new App({
	target: document.querySelector('application'),
	data: store
})
