import fs from 'fs';
export default class Log {
    public static write(string: string): void {
        fs.appendFile('server/log.txt', string, (err) => {
            if (err) throw err;
        });
    }
    public static toConsole(...string: any): void {
        console.log(string);
    }
}