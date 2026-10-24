import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        globals: true,
        environmentMatchGlobs: [
            ['tests/src/**', 'happy-dom'],
            ['tests/server/**', 'node']
        ],
        setupFiles: ['./tests/setup.ts']
    },
    resolve: {
        alias: [
            { find: '@elements', replacement: path.resolve(__dirname, './src/services/elements.ts') },
            { find: /^@services\/(.*)/, replacement: path.resolve(__dirname, './src/services/$1') },
            { find: '@services', replacement: path.resolve(__dirname, './src/services/index.ts') },
            { find: /^@views\/(.*)/, replacement: path.resolve(__dirname, './src/views/$1') },
            { find: '@views', replacement: path.resolve(__dirname, './src/views/index.ts') },
            { find: '@routes', replacement: path.resolve(__dirname, './src/routes.ts') },
            { find: '@entities', replacement: path.resolve(__dirname, './src/entities/index.ts') },
            { find: '@src', replacement: path.resolve(__dirname, './src') },
            { find: '@server', replacement: path.resolve(__dirname, './server') },
            { find: /^services\/database\/entity\/(.*)/, replacement: path.resolve(__dirname, './server/comp/services/database/entity/$1.js') },
            { find: /^controllers\/(.*)/, replacement: path.resolve(__dirname, './server/controllers/$1') },
            { find: 'controllers', replacement: path.resolve(__dirname, './server/controllers') },
            { find: /^services\/(.*)/, replacement: path.resolve(__dirname, './server/services/$1') },
            { find: 'services', replacement: path.resolve(__dirname, './server/services') }
        ]
    }
});
