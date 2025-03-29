import about from '@views/about/about.ctrl';
import aboutTemplate from '@views/about/about.template';
import home from '@views/home/home.ctrl';
import homeTemplate from '@views/home/home.template';
import nav from '@views/nav/nav.ctrl';
import navTemplate from '@views/nav/nav.template';
import sidebar from './sidebar/sidebar.ctrl';
import sidebarTemplate from './sidebar/sidebar.template';
import errorPage from './errorPage/errorPage.template';
import manyWorlds from './manyWorlds/manyWorlds.ctrl';
import manyWorldsTemplate from './manyWorlds/manyWorlds.template';
import currentGames from './currentGames/currentGames.ctrl';
import currentGamesTemplate from './currentGames/currentGames.template';
import store from './store/store.ctrl';
import storeTemplate from './store/store.template';

export { default as about } from '@views/about/about.ctrl';
export { default as aboutTemplate } from '@views/about/about.template';
export { default as home } from '@views/home/home.ctrl';
export { default as homeTemplate } from '@views/home/home.template';
export { default as nav } from '@views/nav/nav.ctrl';
export { default as navTemplate } from '@views/nav/nav.template';
export { default as sidebar } from './sidebar/sidebar.ctrl';
export { default as sidebarTemplate } from './sidebar/sidebar.template';
export { default as errorPage } from './errorPage/errorPage.template';
export { default as manyWorlds } from './manyWorlds/manyWorlds.ctrl';
export { default as manyWorldsTemplate } from './manyWorlds/manyWorlds.template';
export { default as currentGames } from './currentGames/currentGames.ctrl';
export { default as currentGamesTemplate } from './currentGames/currentGames.template';
export { default as store } from './store/store.ctrl';
export { default as storeTemplate } from './store/store.template';

const views = {
    home,
    homeTemplate,
    nav,
    navTemplate,
    about,
    aboutTemplate,
    sidebar,
    sidebarTemplate,
    manyWorlds,
    manyWorldsTemplate,
    currentGames,
    currentGamesTemplate,
    store,
    storeTemplate,
    errorPage
};
export default views;