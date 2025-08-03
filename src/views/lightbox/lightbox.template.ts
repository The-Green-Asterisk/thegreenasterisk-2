import el, {html} from '@elements';

const lightboxTemplate = (srcUrl: string | null, type: 'img' | 'video' | 'iframe', iframeTemplate?: string) => html`
    <el-lightbox>
        <button class="close-lightbox" id="close-lightbox">
            <i class="fas fa-times"></i>
        </button>
        ${ type === 'img'
            ? `<img class="lightbox-img" src="${srcUrl}" alt="Lightbox Image" />`
            : type === 'video'
                ? `<video class="lightbox-video" controls>
                    <source src="${srcUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`
                : type === 'iframe' && !!srcUrl
                    ? `<iframe src="${srcUrl}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>`
                    : ''}
        ${ type === 'iframe' && !!iframeTemplate && !srcUrl ? `${iframeTemplate}` : '' }
    </el-lightbox>
`;
export default lightboxTemplate;