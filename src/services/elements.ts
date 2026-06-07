import BaseEl from "./baseElements";

export default class el extends BaseEl {
    public static get cookieBanner() {
        return this.getElement<HTMLElement>('el-cookie-banner');
    } set cookieBanner(cookieBanner: HTMLElement) {
        this.cookieBanner = cookieBanner;
    }
    public static get cookieBannerButton() {
        return this.getElement<HTMLButtonElement>('el-cookie-banner button');
    } set cookieBannerButton(cookieBannerButton: HTMLButtonElement) {
        this.cookieBannerButton = cookieBannerButton;
    }
    public static get home() {
        return this.getElement<HTMLElement>('el-home');
    } set home(home: HTMLElement) {
        this.home = home;
    }
    public static get profile() {
        return this.getElement<HTMLElement>('el-profile');
    } set profile(profile: HTMLElement) {
        this.profile = profile;
    }
    public static get currentGames() {
        return this.getElement<HTMLElement>('el-current-games');
    } set currentGames(currentGames: HTMLElement) {
        this.currentGames = currentGames;
    }
    public static get survivors() {
        return this.getElement<HTMLElement>('el-survivors');
    } set survivors(survivors: HTMLElement) {
        this.survivors = survivors;
    }
    public static get manyWorlds() {
        return this.getElement<HTMLElement>('el-many-worlds');
    } set manyWorlds(manyWorlds: HTMLElement) {
        this.manyWorlds = manyWorlds;
    }
};
