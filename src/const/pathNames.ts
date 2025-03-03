export default class PathNames {
    public static readonly HOME = '/';

    static basePath = () => `\/${window.location.pathname.split(/[\/#?]/)[1]}`;
    static subdirectories = () => window.location.pathname.split(/[\/#?]/).slice(2);
};