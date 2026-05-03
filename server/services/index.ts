import Database from "./database/index";
import Log from "./log";
import BrowserSync from "./browserSyncService";

export { default as Database } from "./database/index";
export { default as Log } from "./log";
export { default as BrowserSync } from "./browserSyncService";

const Services = {
    Database,
    Log,
    BrowserSync
};
export default Services;