import svelte from 'rollup-plugin-svelte';
import {terser} from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [
  svelte({
		extensions: ['.svelte'],
		dev: !1,
		emitCss: false,
    exclude:'src/**/*.ts'
	}),
  resolve({
    brower: true,
    dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
  }),
  commonjs(),
	babel({ include: 'node_modules/svelte/**' })
];

export default [
	{
    input: 'src/Editor.svelte',
    output:  {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'clEditor'
    },
    plugins: [...plugins, terser(), filesize()]
  },
  {
    input: 'src/Editor.svelte',
    output:  {
      file: 'dist/index.js',
      format: 'umd',
      name: 'clEditor',
    },
    plugins
  },
  {
    input: 'src/app.js',
    output:  {
      file: 'dist/index.dev.js',
      format: 'iife',
    },
    plugins
  }
];
