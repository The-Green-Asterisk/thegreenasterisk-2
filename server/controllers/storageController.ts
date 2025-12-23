import formidable from "formidable";
import fs from "fs";
import http from "http";
import StorageService from "services/storage";
import BaseController from "./baseController";

export default class StorageController extends BaseController {
    constructor() {
        super();
    }

    public static async uploadFile(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const form = formidable({
                maxFileSize: 10 * 1024 * 1024, // 10MB limit
            });
    
            const [fields, files] = await form.parse(req);
            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
            const folder = fields.folder as string | undefined;
            
            if (!uploadedFile) {
                return {
                    response: JSON.stringify('No file uploaded'),
                    status: 400
                };
            }
    
            // Read the file from the temp location
            const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);
            const filename = uploadedFile.originalFilename || 'uploaded_file';
            
            const filePath = await StorageService.saveFileRemote(fileBuffer, filename, folder);
            
            // Clean up temp file
            await fs.promises.unlink(uploadedFile.filepath);
            
            return {
                response: JSON.stringify({ filePath }),
                status: 200
            };
        } catch (error) {
            console.error('File upload error:', error);
            return {
                response: JSON.stringify('File upload failed'),
                status: 500
            };
        }
    }
}