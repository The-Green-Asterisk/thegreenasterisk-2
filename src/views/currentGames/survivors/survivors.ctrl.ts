import el, { html } from '@elements';
import { del, get, post } from '@services/request';
import { Tag } from '../../../entities/Tag';
import { YouTubeVideo } from '../../../entities/YouTubeVideo';

export default async function survivors() {
    if (el.survivors) {
        el.title.textContent = 'Survivors of the Emergence';
        const videoList = el.divs.id('video-list');
        const content = el.divs.id('content');

        const youtubeVideos = await get<YouTubeVideo[]>('/data/get-youtube-videos')
            .catch(error => console.error('Error fetching YouTube videos:', error));

        if (videoList && youtubeVideos) youtubeVideos.forEach(printVideo);

        function printVideo(video: YouTubeVideo) {
            videoList.appendChild(html`
                <div class="video-item">
                    <span><b>${video.episodeNum}:</b> ${video.title}</span>
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
                        ${(el.currentUser?.isAdmin ? `
                        <button class="remove-video" id="remove-video-${video.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>` : '')}
                    </div>
                </div>
            `);
            el.setLightBox();
            const removeButton = el.currentUser?.isAdmin ? el.buttons.id(`remove-video-${video.id}`) : undefined;
            if (removeButton)
                removeButton.onclick = () => {
                    if (confirm(`Are you sure you want to remove ${video.title}?`)) {
                        del('/data/remove-youtube-video', { id: video.id }).then(() => {
                            removeButton.parentElement?.remove();
                        }).catch(error => {
                            console.error('Error removing video:', error);
                            alert('Failed to remove video. Please try again.');
                        });
                    }
                };
        }

        if (content && el.currentUser?.isAdmin) {
            content.appendChild(html`
                <section>
                    <div class="admin-controls">
                        <h2>Admin Controls</h2>
                        <p>Add a new video:</p>
                        <input type="text" id="title" name="title" placeholder="Video Title" />
                        <input type="text" id="description" name="description" placeholder="Video Description" />
                        <input type="number" id="episode-num" name="episode-num" placeholder="Episode Number" />
                        <input type="text" id="embedUrl" name="embedUrl" placeholder="YouTube Embed URL" />
                        <input type="text" id="tags" name="tags" placeholder="Tags (comma separated)" />
                        <button id="add-video">Add Video</button>
                    </div>
                </section>
            `);

            const addVideoButton = el.buttons.id('add-video');

            if (addVideoButton)
                addVideoButton.onclick = () => {
                    const tags = el.inputs.id('tags')?.value.split(',').map(tag => new Tag(tag.trim(),'',true)) ?? [];
                    const title = el.inputs.id('title')?.value;
                    if (!title) {
                        alert('Title is required.');
                        return;
                    }
                    const description = el.inputs.id('description')?.value;
                    if (!description) {
                        alert('Description is required.');
                        return;
                    }
                    const episodeNum = el.inputs.id('episode-num')?.value;
                    if (!episodeNum || isNaN(Number(episodeNum))) {
                        alert('Episode number is required and must be a number.');
                        return;
                    }
                    const embedUrl = el.inputs.id('embedUrl')?.value;
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
                        videoId,
                        embedUrl,
                        url,
                        tags
                    )

                    post<YouTubeVideo>('/data/save-youtube-video', newVideo).then(video => {
                        printVideo(video);
                        el.inputs.forEach(input => input.value = '');
                    }).catch(error => {
                        console.error('Error adding video:', error);
                        alert('Failed to add video. Please try again.');
                    });
                };
        }
    }
}