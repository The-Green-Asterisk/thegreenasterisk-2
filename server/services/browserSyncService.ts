import * as browserSync from 'browser-sync';
import nodemon from 'nodemon';

let bs: browserSync.BrowserSyncInstance | undefined;
let nodemonStarted = false;

export const startBrowserSync = (port: number, host: string, reloadPort: number) => {
    if (!bs) {
        bs = browserSync.create();
        bs.emitter.on('init', () => {
            console.log('BrowserSync initialized.');
        });
        bs.emitter.on('exit', () => {
            console.log('BrowserSync exited.');
        });
        bs.watch('www/**/*.*').on('change', () => {
            bs?.reload();
        });
    }

    if (!nodemonStarted) {
        nodemonStarted = true;
        nodemon({
            script: 'server/comp/main.js',
            ext: 'js,json',
            watch: ['server/comp/'],
            ignore: [
                'www/',
                'node_modules/',
                'server/scratch/',
                'src/',
                'server/comp/services/database/migration/'
            ],
            delay: 800,
            env: {
                BROWSER_SYNC_CHILD: 'true'
            }
        }).on('start', () => {
            console.log('Nodemon started.');
            if (bs && !bs.active) {
                bs.init({
                    reloadDelay: 500, // Wait half a second before reloading
                    reloadDebounce: 500,
                    proxy: `http://${host}:${port}`,
                    port: reloadPort
                });
            }
        }).on('quit', () => {
            console.log('Nodemon quit.');
        }).on('restart', (files) => {
            console.log('Nodemon restarted due to: ', files);
            setTimeout(() => {
                if (bs && bs.active) bs.reload();
            }, 500);
        });
    }
};

export default startBrowserSync;