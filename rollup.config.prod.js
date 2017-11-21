import svelte from 'rollup-plugin-svelte';
import uglify from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript';
import tscompile from 'typescript';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';

const plugins = [ 
    typescript({typescript: tscompile}),
	svelte({
		include: ['src/Editor.html', 'src/helpers/EditorModal.html', 'src/helpers/EditorColorPicker.html'],
		exclude: 'src/**/*.ts'
	}),
	babel({ exclude: 'node_modules/**'})
];

export default [
	{
	   input: 'src/Editor.html',
	   output:  {
		   file: 'dist/index.min.js',
		   format: 'umd',
	   },
	   name: 'clEditor',
	   plugins: [...plugins, uglify(), filesize()],
	   sourcemap: true
   },
   {
		input: 'src/Editor.html',
		output:  {
			file: 'dist/index.js',
			format: 'umd',
		},
		name: 'clEditor',
		plugins,
		sourcemap: true
   },
   {
		input: 'src/app.ts',
		output:  {
			file: 'dist/index.dev.js',
			format: 'iife',
		},
		plugins,
		sourcemap: true
   }
];
