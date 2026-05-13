# mahjong-server

Monorepo 中的 Express 子应用，提供最小可运行 HTTP 服务。

## 运行方式

1. 在仓库根目录安装依赖：

```bash
pnpm install
```

2. 在 `apps/mahjong-server` 目录创建 `.env`（可从示例复制）：

```bash
cp apps/mahjong-server/.env.example apps/mahjong-server/.env
```

3. 启动开发模式（自动重启）：

```bash
pnpm --filter mahjong-server dev
```

4. 生产模式启动：

```bash
pnpm --filter mahjong-server start
```

## 用户系统能力

### 默认数据库配置

应用会默认连接以下 MySQL 配置（可用环境变量覆盖）：

- `MYSQL_HOST=127.0.0.1`
- `MYSQL_PORT=3306`
- `MYSQL_USER=root`
- `MYSQL_PASSWORD=www123456`
- `MYSQL_DATABASE=mahjong`

启动时会自动创建数据库与 `users` 表（若不存在）。

### 认证接口

- `POST /api/auth/register`：用户注册
- `POST /api/auth/login`：用户登录
- `GET /api/auth/me`：获取当前登录用户（需 `Authorization: Bearer <token>`）

注册请求体示例：

```json
{
  "username": "alice_01",
  "password": "12345678"
}
```

登录请求体示例：

```json
{
  "username": "alice_01",
  "password": "12345678"
}
```

### 其他接口

- `GET /`：返回欢迎文本
- `GET /health`：返回健康检查 JSON（含数据库连通状态）

默认端口为 `3000`，可通过 `PORT` 覆盖。JWT 相关配置：

- `JWT_SECRET`（默认 `replace-with-strong-secret`）
- `JWT_EXPIRES_IN`（默认 `7d`）

## 火山 TTS 配置

语音播报代理服务会读取以下环境变量：

- `VOLC_TTS_API_KEY`（必填）
- `VOLC_TTS_RESOURCE_ID`（默认 `seed-tts-2.0`）
- `VOLC_TTS_SPEAKER`（默认 `zh_female_xiaohe_uranus_bigtts`）
- `VOLC_TTS_FORMAT`（默认 `mp3`）
- `VOLC_TTS_SAMPLE_RATE`（默认 `24000`）
- `TTS_SESSION_TTL_MS`（默认 `60000`）
- `TTS_CACHE_MAX_ITEMS`（默认 `500`）
- `TTS_CACHE_TTL_MS`（默认 `86400000`）
- `TTS_CACHE_DIR`（默认 `/private/tmp/mahjong-tts-cache`）

说明：`/api/tts/stream/:token` 会返回 `Cache-Control: private, max-age=<TTS_CACHE_TTL_MS/1000>`，允许浏览器进行私有缓存。
