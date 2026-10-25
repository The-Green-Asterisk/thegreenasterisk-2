import el from '@elements';
import { Tag, YouTubeVideo } from '@entities';
import Helpers from '@services/helpers';
import PushService from '@services/pushService';
import { delData, getData, postData, putData } from '@services/request';

const html = Helpers.html;

export default async function survivors() {
    if (el.survivors) {
        el.title.textContent = 'Survivors of the Emergence';
        const videoList = el.divs.id('video-list')!;
        const seasons = el.divs.id('seasons')!;
        const content = el.divs.id('content');
        const seasonLists = new Map<number, HTMLElement>();
        const subscribeButton = el.buttons.id('notification-button');

        setUpNotificationButton(subscribeButton ?? null);

        const [youtubeVideos, savedSeason] = await Promise.all([
            getData<YouTubeVideo[]>('/get-youtube-videos')
                .catch(error => console.error('Error fetching YouTube videos:', error)),
            getData<number>('/get-current-season')
                .catch(error => console.error('Error fetching current season:', error))
        ]);
        const videoSeasons = (youtubeVideos || []).map(video => video.season);
        // The season shown open and new videos default to; set in Admin Controls
        let currentSeason = savedSeason || Math.max(1, ...videoSeasons);

        const lastSeason = Math.max(currentSeason, ...videoSeasons);
        for (let season = 1; season <= lastSeason; season++) seasonList(season);

        if (videoList && youtubeVideos) youtubeVideos.forEach(printVideo);
        applyCurrentSeason();

        // Opens the current season and closes the rest. Seasons up to the
        // current one always show, as Coming Soon until they have videos.
        function applyCurrentSeason() {
            for (let season = 1; season <= currentSeason; season++) seasonList(season);
            seasonLists.forEach((list, season) => {
                const details = list.parentElement as HTMLDetailsElement;
                if (season > currentSeason && list.querySelector('.coming-soon')) {
                    details.remove();
                    seasonLists.delete(season);
                } else {
                    details.open = season === currentSeason;
                }
            });
            // Only admins have the form; el.inputs has no id() when there are no inputs
            const seasonInput = el.getElement<HTMLInputElement>('#season');
            if (seasonInput) seasonInput.value = String(currentSeason);
        }

        // Videos outside any season (season 0, like Episode Zero) go above the seasons
        function seasonList(season: number) {
            if (season < 1) return videoList;
            let list = seasonLists.get(season);
            if (!list) {
                const details = html`
                    <details class="season">
                        <summary>Season ${season}</summary>
                        <div class="survivor-list">
                            <p class="coming-soon">Coming Soon</p>
                        </div>
                    </details>
                `;
                seasons.appendChild(details);
                list = details.querySelector<HTMLElement>('.survivor-list')!;
                seasonLists.set(season, list);
            }
            return list;
        }

        function printVideo(video: YouTubeVideo) {
            const removeVid = `
                <button class="remove-video" id="remove-video-${video.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `
            const vid = html`
                <div class="video-item">
                    <div class="video-title" title="${video.title}"><b>${video.episodeNum}:</b> ${video.title}</div>
                    <iframe src="${video.embedUrl}" 
                        title="${video.description}" 
                        frameborder="2"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerpolicy="strict-origin-when-cross-origin"
                        srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=https://www.youtube.com/embed/${video.videoId}?autoplay=1><img src=https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg title='${video.description}'><span>▶</span></a>" 
                        allowfullscreen>
                    </iframe>
                    <div class="video-controls">
                        <button class="full-screen-button" id="full-screen-${video.id}" light-box="${video.embedUrl}" light-box-type="iframe">
                            <i class="fas fa-expand"></i>
                        </button>
                        ${el.checkAdmin(removeVid, true)}
                    </div>
                </div>
            `;
            const list = seasonList(video.season);
            list.querySelector('.coming-soon')?.remove();
            list.appendChild(vid);
            const removeButton = el.checkAdmin(el.buttons.id(`remove-video-${video.id}`));
            if (removeButton && typeof removeButton !== 'boolean')
                removeButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to remove ${video.title}?`)) {
                        delData<void>('/remove-youtube-video', { id: video.id }).then(() => {
                            removeButton.parentElement?.remove();
                        }).catch(error => {
                            console.error('Error removing video:', error);
                            alert('Failed to remove video. Please try again.');
                        });
                    }
                }, { signal: el.signal });
        }

        if (content && el.checkAdmin<boolean>()) {
            const adminSection = html`
                <section>
                    <div class="admin-controls">
                        <h2>Admin Controls</h2>
                        <p>Current season (shown open, and where new videos go):</p>
                        <input type="number" id="current-season" name="current-season" min="1" value="${currentSeason}" />
                        <button id="save-current-season">Save Current Season</button>
                        <p>Add a new video:</p>
                        <input type="text" id="title" name="title" placeholder="Video Title" />
                        <input type="text" id="description" name="description" placeholder="Video Description" />
                        <input type="number" id="episode-num" name="episode-num" placeholder="Episode Number" />
                        <input type="number" id="season" name="season" placeholder="Season (0 for none)" value="${currentSeason}" />
                        <input type="text" id="embedUrl" name="embedUrl" placeholder="YouTube Embed URL" />
                        <input type="text" id="tags" name="tags" placeholder="Tags (comma separated)" />
                        <button id="add-video">Add Video</button>
                    </div>
                </section>
            `;
            content.appendChild(adminSection);

            const saveSeasonButton = el.buttons.id('save-current-season');
            if (saveSeasonButton)
                saveSeasonButton.addEventListener('click', () => {
                    const season = Number(el.inputs.id('current-season')?.value);
                    if (!Number.isInteger(season) || season < 1) {
                        alert('Current season must be a whole number of at least 1.');
                        return;
                    }
                    putData('/set-current-season', { season }).then(() => {
                        currentSeason = season;
                        applyCurrentSeason();
                    }).catch(error => {
                        console.error('Error saving current season:', error);
                        alert('Failed to save the current season. Please try again.');
                    });
                }, { signal: el.signal });

            const addVideoButton = el.buttons.id('add-video');

            if (addVideoButton)
                addVideoButton.addEventListener('click', () => {
                    const tags = el.inputs.id('tags')?.value.stripScripts().split(',').map(tag => new Tag(tag.trim(), '', true)) ?? [];
                    const title = el.inputs.id('title')?.value.stripScripts();
                    if (!title) {
                        alert('Title is required.');
                        return;
                    }
                    const description = el.inputs.id('description')?.value.stripScripts();
                    if (!description) {
                        alert('Description is required.');
                        return;
                    }
                    const episodeNum = el.inputs.id('episode-num')?.value.stripScripts();
                    if (!episodeNum || isNaN(Number(episodeNum))) {
                        alert('Episode number is required and must be a number.');
                        return;
                    }
                    const season = el.inputs.id('season')?.value.stripScripts();
                    if (!season || !Number.isInteger(Number(season)) || Number(season) < 0) {
                        alert('Season is required and must be a whole number (0 for none).');
                        return;
                    }
                    const embedUrl = el.inputs.id('embedUrl')?.value.stripScripts();
                    if (!embedUrl) {
                        alert('YouTube Embed URL is required.');
                        return;
                    }
                    const videoIdMatch = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
                    if (!videoIdMatch) {
                        alert('Invalid YouTube Embed URL.');
                        return;
                    }
                    const videoId = videoIdMatch[1];
                    const url = `https://www.youtube.com/watch?v=${videoId}`;

                    const newVideo = new YouTubeVideo(
                        title,
                        description,
                        Number(episodeNum),
                        Number(season),
                        videoId,
                        embedUrl,
                        url,
                        tags
                    )

                    postData<YouTubeVideo>('/save-youtube-video', newVideo).then(video => {
                        printVideo(video);
                        el.inputs.forEach(input => input.value = '');
                        el.inputs.id('season')!.value = String(currentSeason);
                        el.inputs.id('current-season')!.value = String(currentSeason);
                    }).catch(error => {
                        console.error('Error adding video:', error);
                        alert('Failed to add video. Please try again.');
                    });
                }, { signal: el.signal });
        }
    }
}

async function setUpNotificationButton(button: HTMLButtonElement | null) {
    if (!button) return;

    if (!PushService.isSupported()) {
        button.title = PushService.isIos()
            ? 'To get notifications on iPhone or iPad, add The Green Asterisk to your Home Screen.'
            : 'Push notifications are not supported in this browser.';
        button.disabled = true;
        return;
    }

    try {
        const registration = await PushService.registerServiceWorker('/sw.js');
        let subscription = await PushService.getSubscription(registration);

        const updateButtonState = () => {
            const icon = button.querySelector('i');
            if (subscription && Notification.permission === 'granted') {
                button.classList.add('active');
                button.title = 'Unsubscribe from new episode notifications';
                if (icon) {
                    icon.className = 'fa-solid fa-bell';
                }
            } else {
                button.classList.remove('active');
                button.title = 'Subscribe to notifications of new episodes';
                if (icon) {
                    icon.className = 'fa-regular fa-bell';
                }
            }
        };

        if (subscription && Notification.permission === 'granted') {
            PushService.saveSubscription(subscription, 'videos').catch(() => { });
        }
        updateButtonState();

        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                if (subscription && Notification.permission === 'granted') {
                    await PushService.unsubscribe(subscription, 'videos').catch(() => { });
                    subscription = null;
                } else {
                    const permission = await PushService.requestPermission();
                    if (permission === 'granted') {
                        subscription = await PushService.subscribe(registration, 'videos');
                    } else if (permission === 'denied') {
                        alert('Notifications are blocked in your browser settings. Please enable them to subscribe.');
                    }
                }
            } catch (error) {
                console.error('Error updating notification subscription:', error);
                alert('Could not update notification subscription. Please try again.');
            } finally {
                button.disabled = false;
                updateButtonState();
            }
        }, { signal: el.signal });
    } catch (error) {
        console.warn('Could not initialize push notifications on Survivors page:', error);
    }
}
