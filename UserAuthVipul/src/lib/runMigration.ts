import "server-only";
import path from "path";
import migrate from "node-pg-migrate";
import { env } from "./env-server";

// Define migrations directory
const MIGRATION_DIR = path.join(process.cwd(), "migrations");

export async function runMigrations() {
  console.log("Running database migrations...");

  try {
    await migrate({
      schema: "public",
      direction: "up",
      log: console.log,
      dir: MIGRATION_DIR,
      migrationsTable: "pgmigrations",

       databaseUrl: env.DATABASE_URL,
    });

    console.log("✅ Migrations completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  }
}