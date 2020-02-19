import svelte from 'rollup-plugin-svelte';
import {terser} from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript';
import tscompile from 'typescript';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';

import resolve from "rollup-plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import commonjs from "rollup-plugin-commonjs";

const plugins = [
    //typescript({typescript: tscompile}),
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
	babel({ exclude: 'node_modules/**'})
];

export default [
	{
	   input: 'src/Editor.svelte',
	   output:  {
		   file: 'dist/index.min.js',
		   format: 'umd',
	   },
	   name: 'clEditor',
	   plugins: [...plugins, terser(), filesize()],
	   sourcemap: true
   },
   {
		input: 'src/Editor.svelte',
		output:  {
			file: 'dist/index.js',
			format: 'umd',
		},
		name: 'clEditor',
		plugins,
		sourcemap: true
   },
   {
		input: 'src/app.js',
		output:  {
			file: 'dist/index.dev.js',
			format: 'iife',
		},
		plugins,
		sourcemap: true
   }
];
