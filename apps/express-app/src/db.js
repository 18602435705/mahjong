import mysql from "mysql2/promise";
import { appConfig } from "./config.js";

const DATABASE_NAME_PATTERN = /^[A-Za-z0-9_]+$/;

if (!DATABASE_NAME_PATTERN.test(appConfig.db.database)) {
  throw new Error(
    "Invalid MYSQL_DATABASE value: only letters, numbers, and underscores are allowed.",
  );
}

let dbPool;

export async function initDatabase() {
  const bootstrapConnection = await mysql.createConnection({
    host: appConfig.db.host,
    port: appConfig.db.port,
    user: appConfig.db.user,
    password: appConfig.db.password,
  });

  await bootstrapConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${appConfig.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await bootstrapConnection.end();

  dbPool = mysql.createPool({
    host: appConfig.db.host,
    port: appConfig.db.port,
    user: appConfig.db.user,
    password: appConfig.db.password,
    database: appConfig.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(64) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_users_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export function getDbPool() {
  if (!dbPool) {
    throw new Error("Database pool has not been initialized.");
  }
  return dbPool;
}

export async function pingDatabase() {
  const [rows] = await getDbPool().query("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}
