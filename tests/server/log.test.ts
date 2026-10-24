import fs from 'fs';
import { describe, expect, it, vi } from 'vitest';
import Log from '../../server/services/log';

describe('Log Service', () => {
    it('toConsole logs to console.log', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        Log.toConsole('Hello', 'World');
        expect(consoleSpy).toHaveBeenCalledWith(['Hello', 'World']);
        consoleSpy.mockRestore();
    });

    it('write calls fs.appendFile', () => {
        const appendSpy = vi.spyOn(fs, 'appendFile').mockImplementation((path, data, cb: any) => {
            cb(null);
        });

        Log.write('Test log entry\n');
        expect(appendSpy).toHaveBeenCalledWith('server/log.txt', 'Test log entry\n', expect.any(Function));
        appendSpy.mockRestore();
    });
});
