import about from '@views/about/about.ctrl';
import aboutTemplate from '@views/about/about.template';
import home from '@views/home/home.ctrl';
import homeTemplate from '@views/home/home.template';
import nav from '@views/nav/nav.ctrl';
import navTemplate from '@views/nav/nav.template';
import docs from './docs/docs.ctrl';
import DocsRoutes from './docs/docs.routes';
import docsTemplate from './docs/docs.template';
import sidebar from './sidebar/sidebar.ctrl';
import sidebarTemplate from './sidebar/sidebar.template';
import githubButtonTemplate from './github-button/githubButton.template';

export { default as about } from '@views/about/about.ctrl';
export { default as aboutTemplate } from '@views/about/about.template';
export { default as home } from '@views/home/home.ctrl';
export { default as homeTemplate } from '@views/home/home.template';
export { default as nav } from '@views/nav/nav.ctrl';
export { default as navTemplate } from '@views/nav/nav.template';
export { default as docs } from './docs/docs.ctrl';
export { default as DocsRoutes } from './docs/docs.routes';
export { default as docsTemplate } from './docs/docs.template';
export { default as sidebar } from './sidebar/sidebar.ctrl';
export { default as sidebarTemplate } from './sidebar/sidebar.template';
export { default as githubButtonTemplate } from './github-button/githubButton.template';

const views = {
    home,
    homeTemplate,
    nav,
    navTemplate,
    about,
    aboutTemplate,
    sidebar,
    sidebarTemplate,
    docs,
    docsTemplate,
    DocsRoutes,
    githubButtonTemplate
};
export default views;