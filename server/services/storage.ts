import fs from 'fs';
import path from 'path';

export default class StorageService {
    static async saveFile(data: Buffer, name: string | null = null, folder: string | null = null): Promise<string> {
        const uploadsDir = path.join(__dirname, '..', '..', '..', 'www', 'storage');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        const filename = `${name ? name + Date.now().toString() : Date.now().toString()}`;
        const filePath = `${uploadsDir}/${folder ? folder + '/' : ''}${filename}`;
        await fs.promises.writeFile(filePath, data);
        return `/storage/${folder ? folder + '/' : ''}${filename}`;
    }

    static async deleteFile(filePath: string): Promise<void> {
        const fullPath = path.join(__dirname, '..', '..', '..', 'www', filePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    }
}