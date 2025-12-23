import fs from 'fs';
import path from 'path';

export default class StorageService {
    static async saveFile(data: Buffer, name: string | null = null, folder: string | null = null): Promise<string> {
        const uploadsDir = path.join(__dirname, '..', '..', '..', 'www', 'storage');
        const backupDir = path.join(__dirname, '..', '..', '..', 'src', 'storage');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        let extension = '';
        if (name) {
            extension = path.extname(name);
            name = name.split('.').slice(0, -1).join('.');
        }
        const filename = `${name ? name + Date.now().toString() : Date.now().toString()}${extension}`;
        const filePath = `${uploadsDir}/${folder ? folder + '/' : ''}${filename}`;
        await fs.promises.writeFile(filePath, data).catch(err => {
            throw new Error('Failed to save file: ' + err.message);
        });

        const backupFilePath = `${backupDir}/${folder ? folder + '/' : ''}${filename}`;
        await fs.promises.writeFile(backupFilePath, data).catch(err => {
            console.error('Failed to save backup file: ' + err.message);
        });

        return `/storage/${folder ? folder + '/' : ''}${filename}`;
    }

    static async deleteFile(filePath: string): Promise<void> {
        const fullPath = path.join(__dirname, '..', '..', '..', 'www', filePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        } else {
            throw new Error('File does not exist');
        }
    }
}