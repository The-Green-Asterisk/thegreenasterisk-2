import path from 'path';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from './entity/User';

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
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [path.join(__dirname, '..', '..', 'services', 'database', 'migration', '*.{js,ts}')],
    subscribers: [],
})