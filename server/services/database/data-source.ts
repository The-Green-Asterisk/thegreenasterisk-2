import path from 'path';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserContentSubscriber } from "./userContentSubscriber";

if (!process.env.DB_HOST) {
    require("dotenv").config();
    if (!process.env.DB_HOST) {
        throw new Error("Please provide a DB_HOST environment variable");
    }
}

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "3306"),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: Array.from(new Set([
        path.resolve(__dirname, 'entity', '*.{js,ts}').replace(/\\/g, '/'),
        path.resolve(__dirname, '..', '..', 'services', 'database', 'entity', '*.{js,ts}').replace(/\\/g, '/')
    ])),
    migrations: Array.from(new Set([
        path.resolve(__dirname, 'migration', '*.{js,ts}').replace(/\\/g, '/'),
        path.resolve(__dirname, '..', '..', 'services', 'database', 'migration', '*.{js,ts}').replace(/\\/g, '/')
    ])),
    subscribers: [UserContentSubscriber],
})