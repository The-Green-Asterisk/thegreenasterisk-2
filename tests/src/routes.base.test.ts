import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@views', () => ({
    default: {
        homeTemplate: vi.fn(() => document.createElement('div')),
        home: vi.fn(),
        errorPage: vi.fn(() => document.createElement('div')),
    }
}));

import RoutesBase from '../../src/routes.base';

describe('RoutesBase', () => {
    beforeEach(() => {
        history.replaceState({}, '', '/');
        localStorage.clear();
    });

    it('parses URL query parameters correctly into booleans, numbers, and strings', () => {
        history.replaceState({}, '', '/?flag=true&count=42&name=dungeon&inactive=false');

        const routes = new RoutesBase(['test']);
        expect(routes.query.flag).toBe(true);
        expect(routes.query.inactive).toBe(false);
        expect(routes.query.count).toBe(42);
        expect(routes.query.name).toBe('dungeon');
    });

    it('invokes matching method handler on view() call', () => {
        const handler = vi.fn();
        class TestRoutes extends RoutesBase {
            ['sampleRoute']() {
                handler();
            }
        }

        const router = new TestRoutes(['sampleRoute']);
        router.view();
        expect(handler).toHaveBeenCalledTimes(1);
    });
});
