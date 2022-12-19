import typescriptPlugin from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json' assert { type: 'json' }

export default {
	input: 'src/index.ts',
	output: [
		{
			dir: 'dist/cjs',
			format: 'cjs',
			sourcemap: true
		},
		{
			dir: 'dist/esm',
			format: 'esm',
			sourcemap: true
		}
	],
	external: Object.keys(pkg.dependencies),
	plugins: [typescriptPlugin(), nodeResolve(), commonjs()]
}
