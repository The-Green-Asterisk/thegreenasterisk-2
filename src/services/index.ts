import BaseEl from "./baseElements";
import CookieJar from "./cookieJar";
import Helpers from "./helpers";
import request from "./request";
import StorageBox from "./storageBox";

export { default as BaseEl } from "./baseElements";
export { default as CookieJar } from "./cookieJar";
export { default as Helpers } from "./helpers";
export { default as request } from "./request";
export { default as StorageBox } from "./storageBox";

const services = {
    CookieJar,
    request,
    StorageBox,
    Helpers,
    BaseEl
};
export default services;