import formidable from "formidable";
import fs from "fs";
import http from "http";
import StorageService from "services/storage";
import BaseController from "./baseController";

export default class StorageController extends BaseController {
    constructor() {
        super();
    }

    public static async uploadFile(req: http.IncomingMessage, res: http.ServerResponse): Promise<{ response: string; header: string; status: number }> {
        const { folder } = this.parseUrlQuery(req.url);

        if (Array.isArray(folder)) return {
            response: 'Invalid folder parameter',
            header: 'application/json',
            status: 400
        };
        
        try {
            const form = formidable({
                maxFileSize: 10 * 1024 * 1024, // 10MB limit
            });
    
            const [fields, files] = await form.parse(req);
            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
            
            if (!uploadedFile) {
                return {
                    response: 'No file uploaded',
                    header: 'application/json',
                    status: 400
                };
            }
    
            // Read the file from the temp location
            const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);
            const filename = uploadedFile.originalFilename || 'uploaded_file';
            
            const fileUrl = await StorageService.saveFile(fileBuffer, filename, folder);
            
            // Clean up temp file
            await fs.promises.unlink(uploadedFile.filepath);
            
            return {
                response: JSON.stringify({ imageUrl: fileUrl }),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error('File upload error:', error);
            return {
                response: 'File upload failed',
                header: 'application/json',
                status: 500
            };
        }
    }
}