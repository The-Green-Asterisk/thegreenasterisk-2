import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetData = vi.fn();
const mockPostData = vi.fn();
const mockPutData = vi.fn();
const mockDelData = vi.fn();

vi.mock('@services/request', () => ({
    getData: (...args: any[]) => mockGetData(...args),
    postData: (...args: any[]) => mockPostData(...args),
    putData: (...args: any[]) => mockPutData(...args),
    delData: (...args: any[]) => mockDelData(...args),
    getHtml: vi.fn(),
}));

import el from '@elements';
import { renderUserLinks } from '../../../src/views/links/userLinks';

describe('renderUserLinks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        el.currentUser = undefined;
        el.sessionKey = '';
    });

    it('renders user links and hides edit controls when canEdit is false', async () => {
        mockGetData.mockResolvedValueOnce([
            { id: 1, url: 'https://example.com', iconClass: 'fa-solid fa-link', imageUrl: '', text: 'My Link', primaryType: true, sortOrder: 1, userId: 7 },
        ]);
        const container = document.createElement('div');
        document.body.appendChild(container);

        await renderUserLinks({ container, userId: 7, canEdit: false });

        expect(mockGetData).toHaveBeenCalledWith('/get-links', { userId: 7 });
        expect(container.querySelectorAll('.link')).toHaveLength(1);
        expect(container.querySelector('.link-text')?.textContent?.trim()).toBe('My Link');
        expect(container.querySelector('.ctrlBtns')).toBeNull();
    });

    it('renders empty text when user has no links and canEdit is false', async () => {
        mockGetData.mockResolvedValueOnce([]);
        const container = document.createElement('div');

        await renderUserLinks({ container, userId: 7, canEdit: false, emptyText: 'No links added yet.' });

        expect(container.querySelector('.links-empty')?.textContent).toBe('No links added yet.');
    });

    it('renders edit controls and Create New Link button when canEdit is true', async () => {
        mockGetData.mockResolvedValueOnce([
            { id: 1, url: 'https://example.com', iconClass: 'fa-solid fa-link', imageUrl: '', text: 'My Link', primaryType: true, sortOrder: 1, userId: 7 },
        ]);
        const container = document.createElement('div');

        await renderUserLinks({ container, userId: 7, canEdit: true });

        expect(container.querySelectorAll('.link')).toHaveLength(2);
        expect(container.querySelector('.ctrlBtns')).not.toBeNull();
        expect(container.querySelector('.fa-grip-lines')).not.toBeNull();
        const texts = Array.from(container.querySelectorAll('.link-text')).map(n => n.textContent?.trim());
        expect(texts).toContain('Create New Link');
    });
});
