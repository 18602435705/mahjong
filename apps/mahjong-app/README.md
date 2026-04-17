# mahjong-app

麻将前端应用，包含认证页、大厅页与对局页。

## 已实现页面

- `/auth`：登录/注册同页切换（用户名 + 密码）
- `/lobby`：大厅页（mock 房间列表、创建房间、加入房间）
- `/game`：麻将对局页（沿用现有桌面 UI）

未登录访问 `/lobby` 与 `/game` 时会自动跳转 `/auth`。

## 运行

1. 在仓库根目录安装依赖：

```bash
pnpm install
```

2. 启动开发：

```bash
pnpm --filter mahjong-app dev
```

## API 地址配置

项目通过 `VITE_API_BASE_URL` 读取后端地址。

可在 `apps/mahjong-app` 下新建 `.env`：

```bash
VITE_API_BASE_URL=http://127.0.0.1:3000
```

如未配置，则默认使用 `http://127.0.0.1:3000`。

## 对接接口

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`（预留，可用于会话校验）
