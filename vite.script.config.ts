import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const externalPackages = [
	...Object.keys(pkg.dependencies),
	...Object.keys(pkg.devDependencies),
	/^node:/
];

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, 'src/lib')
		}
	},
	build: {
		outDir: 'build/scripts',
		emptyOutDir: false,
		target: 'node20',
		minify: false,
		lib: {
			entry: path.resolve(__dirname, 'src/lib/server/scripts/create-user.ts'),
			formats: ['es'],
			fileName: 'create-user'
		},
		rollupOptions: {
			external: externalPackages
		}
	}
});
