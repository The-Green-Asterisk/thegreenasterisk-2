import BaseEl from "./baseElements";

export default class el extends BaseEl {
    public static get cookieBanner() {
        return this.getElement<HTMLElement>('el-cookie-banner');
    }
    public static get cookieBannerButton() {
        return this.getElement<HTMLButtonElement>('el-cookie-banner button');
    }
    public static get home() {
        return this.getElement<HTMLElement>('el-home');
    }
    public static get profile() {
        return this.getElement<HTMLElement>('el-profile');
    }
    public static get currentGames() {
        return this.getElement<HTMLElement>('el-current-games');
    }
    public static get survivors() {
        return this.getElement<HTMLElement>('el-survivors');
    }
    public static get manyWorlds() {
        return this.getElement<HTMLElement>('el-many-worlds');
    }
    public static get links() {
        return this.getElement<HTMLElement>('el-links');
    }
};
