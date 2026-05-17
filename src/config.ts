import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
};

type APIConfig = {
    fileserverHits: number;
    port: number
    jwt_secret: string,
    jwt_timeout: number
    polka_key: string
};

type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig
}

process.loadEnvFile();
if (!process.env.DB_URL) throw new Error("Invalid or missing DB_URL (database URL) environment variable.");
if (!process.env.JWT_SECRET) throw new Error("Invalid or missing JWT_SECRET environment variable.");
if (!process.env.POLKA_KEY) throw new Error("Invalid or missing polka API key.");
export const config: Config = {
    api: {
        fileserverHits: 0, 
        port: 8080,
        jwt_secret: process.env.JWT_SECRET,
        jwt_timeout: 3600,
        polka_key: process.env.POLKA_KEY,
    },
    db: {
        url: process.env.DB_URL, 
        migrationConfig: {
            migrationsFolder: "./src/db/migrations",
        }
    },
    
};

const migrationClient = postgres(config.db.url, {max: 1});
await migrate(drizzle(migrationClient), config.db.migrationConfig);