import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';


export default class StorageService {
    constructor() {
    }

    static async saveFile(data: Buffer, name: string | null = null, folder: string | null = null): Promise<string> {
        const uploadsDir = path.join(__dirname, '..', '..', '..', 'www', 'storage');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
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

    static async saveFileRemote(data: Buffer, name: string | undefined = undefined, folder: string | undefined = undefined): Promise<string> {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            require('dotenv').config();
        }
        const tempPath = await this.saveFile(data, name);
        const absolutePath = path.join(__dirname, '..', '..', '..', 'www', tempPath);

        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const result = await cloudinary.uploader.unsigned_upload(absolutePath, 'ml_default').catch(err => {
            throw new Error('Failed to upload file: ' + err.message);
        });

        await this.deleteFile(tempPath).catch(err => {
            console.error('Failed to delete temp file: ' + err.message);
        });

        if (result && result.secure_url) {
            return result.secure_url;
        } else {
            throw new Error('Failed to upload file');
        }
    }

    static async deleteFileRemote(publicId: string): Promise<void> {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            require('dotenv').config();
        }
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        await cloudinary.uploader.destroy(publicId).catch(err => {
            throw new Error('Failed to delete file: ' + err.message);
        });
    }
}