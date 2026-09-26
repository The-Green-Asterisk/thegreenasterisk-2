import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";

let initPromise: Promise<DataSource> | null = null;

export const initDatabase = async (): Promise<DataSource> => {
    if (AppDataSource.isInitialized) {
        return AppDataSource;
    }
    if (!initPromise) {
        initPromise = AppDataSource.initialize()
            .then(() => {
                console.log("Database initialized");
                return AppDataSource;
            })
            .catch((error) => {
                console.error("Database initialization failed:", error);
                initPromise = null;
                throw error;
            });
    }
    return initPromise;
};

if (typeof require !== 'undefined' && require.main === module) {
    initDatabase();
}

export { AppDataSource };
export default AppDataSource;