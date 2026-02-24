export default {
  migrationsTable: "pgmigrations",
  dir: "migrations",
  databaseUrl: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  },
};
