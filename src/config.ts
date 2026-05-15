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
};

type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig
}

process.loadEnvFile();
if (!process.env.DB_URL) throw new Error("Invalid database URL.");
export const config: Config = {
    api: {
        fileserverHits: 0, 
        port: 8080
    },
    db: {
        url: process.env.DB_URL, 
        migrationConfig: {
            migrationsFolder: "./src/db/migrations",
        }
    }
};

const migrationClient = postgres(config.db.url, {max: 1});
await migrate(drizzle(migrationClient), config.db.migrationConfig);