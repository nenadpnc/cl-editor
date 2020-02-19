import svelte from 'rollup-plugin-svelte';
import typescript from 'rollup-plugin-typescript';
import tscompile from 'typescript';
import babel from 'rollup-plugin-babel';

import resolve from "rollup-plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import commonjs from "rollup-plugin-commonjs";

const plugins = [
    svelte({
		extensions: [".svelte"],
		dev: !1,
		emitCss: false,
        exclude:'src/**/*.ts'
	}),
    resolve({
		brower: true,
		dedupe: importee =>
			importee === "svelte" ||
			importee.startsWith("svelte/")
	}),
	commonjs(),
	babel({ include: 'node_modules/svelte/**'})
];

export default {
	input: 'src/app.js',
	output:  {
		file: 'dist/index.dev.js',
		format: 'iife',
        name:'editor'
	},
	plugins,
	sourcemap: false
};
