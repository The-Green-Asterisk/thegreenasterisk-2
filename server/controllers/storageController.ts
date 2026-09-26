import formidable from "formidable";
import fs from "fs";
import http from "http";
import path from "path";
import StorageService from "services/storage";
import BaseController from "./baseController";
import SessionController from "./sessionController";

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

export default class StorageController extends BaseController {
    constructor() {
        super();
    }

    public static async uploadFile(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }

        try {
            const form = formidable({
                maxFileSize: 10 * 1024 * 1024, // 10MB limit
            });

            const [fields, files] = await form.parse(req);
            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
            const rawFolder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder;

            if (!uploadedFile) {
                return {
                    response: JSON.stringify('No file uploaded'),
                    status: 400
                };
            }

            const rawFilename = uploadedFile.originalFilename || 'uploaded_file';
            const extension = path.extname(rawFilename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.has(extension)) {
                if (uploadedFile.filepath && fs.existsSync(uploadedFile.filepath)) {
                    await fs.promises.unlink(uploadedFile.filepath).catch(() => { });
                }
                return {
                    response: JSON.stringify('Invalid file type. Allowed: ' + Array.from(ALLOWED_EXTENSIONS).join(', ')),
                    status: 400
                };
            }

            // Sanitize filename and folder to prevent path traversal
            const baseName = path.basename(rawFilename, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
            const sanitizedFilename = `${baseName || 'file'}${extension}`;
            const sanitizedFolder = rawFolder ? path.basename(rawFolder).replace(/[^a-zA-Z0-9_-]/g, '_') : undefined;

            // Read the file from the temp location
            const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);

            const filePath = await StorageService.saveFileRemote(fileBuffer, sanitizedFilename, sanitizedFolder);

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