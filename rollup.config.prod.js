import svelte from 'rollup-plugin-svelte';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import tscompile from 'typescript';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';

const plugins = [ 
    typescript({typescript: tscompile}),
    nodeResolve({ 
    	jsnext: true, 
    	main: true,
    	browser: true
    }),
	commonjs(),
	svelte({
		include: ['src/Editor.html', 'src/helpers/EditorModal.html', 'src/helpers/EditorColorPicker.html'],
		exclude: 'src/**/*.ts'
	}),
	babel({ exclude: 'node_modules/**'}),
	uglify(),
	filesize()
];

export default {
	input: 'src/Editor.html',
	output:  {
		file: 'dist/index.js',
		format: 'umd',
	},
	name: 'clEditor',
	plugins,
	sourcemap: true
};
