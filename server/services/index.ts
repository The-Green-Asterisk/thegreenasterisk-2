import Database from "./database/index";
import Log from "./log";

export { default as Database } from "./database/index";
export { default as Log } from "./log";

const Services = {
    Database,
    Log
};
export default Services;