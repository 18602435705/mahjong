const defaultPort = 3000;
const defaultDbPort = 3306;

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appConfig = {
  port: toNumber(process.env.PORT, defaultPort),
  jwtSecret: process.env.JWT_SECRET || "replace-with-strong-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  db: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: toNumber(process.env.MYSQL_PORT, defaultDbPort),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "www123456",
    database: process.env.MYSQL_DATABASE || "mahjong",
  },
};
