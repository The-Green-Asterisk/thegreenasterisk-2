// Shows PR digest alerts pushed by the server. Plain JS because esbuild only
// bundles main.ts, and this has to be served from the root as /sw.js.

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(self.registration.showNotification(data.title ?? 'PR Digest', {
        body: data.body,
        tag: data.tag,
        renotify: !!data.tag,
        icon: '/storage/images/favicon.png',
        data: { url: data.url ?? '/pr-digest' }
    }));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/pr-digest';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
            const open = windows.find(window => new URL(window.url).pathname === url);
            return open ? open.focus() : self.clients.openWindow(url);
        })
    );
});
