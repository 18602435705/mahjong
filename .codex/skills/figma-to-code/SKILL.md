---
name: figma-to-code
description: 将 Figma 设计稿转为 React 页面与组件的像素级还原工作流。适用于收到 Figma URL 或 node-id，且需要在本仓库内完成组件拆分、CSS Modules + Less 样式实现与视觉一致性校验的场景。
---

# Figma 转代码

## 目标

- 将 Figma 节点转成可维护的 React 代码，视觉还原度不低于 95%。
- 遵循本仓库前端规范：`CSS Modules + Less` 与语义化组件结构。

## 工作流程

1. 解析 Figma 链接，提取 `fileKey` 与 `node-id`。
2. 使用 f2c MCP 工具获取生成代码与设计图（如果可用）。
3. 编码前先分析布局，并按视觉独立性拆分组件。
4. 先实现 TSX，再补充 Less 样式，最后处理状态与交互。
5. 本地运行并做视觉对比，按差异迭代优化。

## 项目规范

- 最终代码使用 `CSS Modules + Less`，不要保留 Tailwind 类名。
- 类名拼接使用 `clsx`，不要使用模板字符串拼接 className。
- 组件名与样式类名保持语义化。
- 间距、圆角、行高、`font-weight` 等值保持与设计稿一致，包含 `350` 这类非常规字重。

## 目录结构

```text
pages/{page}/
├── index.tsx
├── index.module.less
├── assets/
└── components/
    └── {ComponentName}/
        ├── index.tsx
        └── index.module.less
```

## Tailwind 到 Less 映射

```text
w-[1440px] h-[900px]       -> width: 1440px; height: 900px;
absolute top-[24px] left-0 -> position: absolute; top: 24px; left: 0;
flex flex-col              -> display: flex; flex-direction: column;
rounded-[22px]             -> border-radius: 22px;
bg-[rgba(102,68,249,1)]    -> background: #6644F9;
```

## 类名拼接示例

```tsx
import clsx from 'clsx';

className={clsx(styles.button, styles.primary, className)}
```

## 质量标准

- 视觉还原度 >= 95%
- TypeScript 零报错
- 无明显重叠、溢出或错位
- 所有资源正常加载
