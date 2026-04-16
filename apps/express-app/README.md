# express-app

Monorepo 中的 Express 子应用，提供最小可运行 HTTP 服务。

## 运行方式

1. 在仓库根目录安装依赖：

```bash
pnpm install
```

2. 启动开发模式（自动重启）：

```bash
pnpm --filter express-app dev
```

3. 生产模式启动：

```bash
pnpm --filter express-app start
```

## 默认接口

- `GET /`：返回欢迎文本
- `GET /health`：返回健康检查 JSON

默认端口为 `3000`，可通过环境变量 `PORT` 覆盖。
