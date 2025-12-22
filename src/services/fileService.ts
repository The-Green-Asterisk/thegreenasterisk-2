export default class FileService {
    /** Returns a Promise of the file path as a string */
    public static async uploadFile(file: File, folder: string | null = null): Promise<string> {
        file.size > 10 * 1024 * 1024 && (() => { throw new Error('File size exceeds 10MB limit'); })();
        const formData = new FormData();
        formData.append('file', file);
        if (folder) {
            formData.append('folder', folder);
        }
        const response = await fetch('/data/upload-file', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('File upload failed');
        }
        const data = await response.json();
        return data.filePath;
    }
}