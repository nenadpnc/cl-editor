import svelte from 'rollup-plugin-svelte';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import tscompile from 'typescript';

// 插件顺序不要乱
const plugins = [ 

    typescript({typescript: tscompile}),
    nodeResolve({ 
    	jsnext: true, 
    	main: true,
    	module: true
    }),
	commonjs(),

	svelte({
		include: ['src/pages/**.html', 'src/components/**.html'],
		exclude: 'src/**/*.ts'
	})
];

if ( process.env.production ) plugins.push( uglify() );

export default {
	entry: 'src/app.ts',
	dest: 'dist/bundle.js',
	format: 'iife',
	plugins,
	sourceMap: true
};
