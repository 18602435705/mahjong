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
    timezone: "+08:00",
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

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '历史对局主键ID',
      room_code VARCHAR(16) NOT NULL COMMENT '房间号',
      room_instance_key VARCHAR(96) NOT NULL COMMENT '房间实例唯一键（roomCode+createdAt）',
      owner_user_id BIGINT UNSIGNED NULL COMMENT '房主用户ID',
      ended_at TIMESTAMP NOT NULL COMMENT '对局结束时间',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '历史记录创建时间',
      PRIMARY KEY (id),
      UNIQUE KEY uk_matches_room_instance_key (room_instance_key),
      KEY idx_matches_owner_user_id (owner_user_id),
      KEY idx_matches_ended_at (ended_at),
      CONSTRAINT fk_matches_owner_user
        FOREIGN KEY (owner_user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对局历史主表';
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS match_players (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '对局玩家记录主键ID',
      match_id BIGINT UNSIGNED NOT NULL COMMENT '关联对局ID',
      user_id BIGINT UNSIGNED NOT NULL COMMENT '玩家用户ID',
      username_snapshot VARCHAR(64) NOT NULL COMMENT '结算时用户名快照',
      seat_index TINYINT UNSIGNED NOT NULL COMMENT '绝对座位下标（0-3）',
      score INT NOT NULL COMMENT '该局结算分数',
      \`rank\` TINYINT UNSIGNED NOT NULL COMMENT '该局名次',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
      PRIMARY KEY (id),
      UNIQUE KEY uk_match_players_match_user (match_id, user_id),
      KEY idx_match_players_user_match (user_id, match_id),
      CONSTRAINT fk_match_players_match
        FOREIGN KEY (match_id) REFERENCES matches(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对局玩家明细表';
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
