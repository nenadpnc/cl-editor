import svelte from 'rollup-plugin-svelte';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import tscompile from 'typescript';
import babel from 'rollup-plugin-babel';

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
];

export default {
	input: 'src/app.ts',
	output:  {
		file: 'dist/index.dev.js',
		format: 'iife',
	},
	plugins,
	sourcemap: true
};
