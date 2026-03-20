export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "React 19 新特性前瞻",
    excerpt: "深入探讨 React 19 带来的重大更新，包括 Server Components 的新进展和性能优化。",
    content: `React 19 带来了许多令人兴奋的新特性。首先，Server Components 的进一步完善使得构建混合应用变得更加简单。其次，性能优化方面，新的调度算法让页面响应更加迅速。

    在开发者体验方面，React 19 简化了 Context 的使用方式，减少了不必要的重新渲染。同时，新的 Hook 也为状态管理提供了更多可能性。

    对于团队来说，升级到 React 19 意味着可以享受到更好的性能和更简洁的代码。建议大家尽早开始迁移。`,
    author: "张三",
    date: "2026-03-15",
    readTime: "8 分钟",
    tags: ["React", "前端开发", "JavaScript"],
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    title: "TypeScript 高级类型技巧",
    excerpt: "掌握 TypeScript 的高级类型系统，包括条件类型、映射类型和工具类型的深入应用。",
    content: `TypeScript 的类型系统非常强大。条件类型允许我们根据类型参数动态决定返回类型。映射类型则可以遍历对象的属性并进行转换。

    实际开发中，我们经常需要联合类型和交叉类型的组合使用来表达复杂的业务逻辑。理解这些高级类型对于编写可维护的代码至关重要。

    建议每天花一点时间练习类型编程，慢慢地就会形成直觉。`,
    author: "李四",
    date: "2026-03-12",
    readTime: "12 分钟",
    tags: ["TypeScript", "编程语言", "教程"],
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    title: "现代 CSS 布局指南",
    excerpt: "掌握 Grid 和 Flexbox 布局，以及 Container Queries 等现代 CSS 特性。",
    content: `现代 CSS 布局已经变得非常强大。Grid 布局让我们可以轻松创建二维布局，而 Flexbox 则擅长一维布局。

    Container Queries 是一个革命性的特性，它允许我们根据容器的大小而不是视口大小来响应式设计。

    还有一些实用技巧：使用 subgrid 进行嵌套网格对齐，使用 :has() 选择器进行父元素选择等。

    推荐实践：从简单开始，逐步增加复杂度，保持代码的可读性。`,
    author: "王五",
    date: "2026-03-10",
    readTime: "10 分钟",
    tags: ["CSS", "前端开发", "布局"],
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
  },
  {
    id: 4,
    title: "Vite 构建工具最佳实践",
    excerpt: "深入 Vite 的工作原理，以及如何优化构建配置和开发体验。",
    content: `Vite 因其极速的开发体验而受到欢迎。它利用浏览器的 ES Modules 特性，只在需要时编译代码。

    生产构建方面，Vite 基于 Rollup，提供了优秀的代码分割和静态资源优化。

    一些优化建议：
    - 使用按需导入减少初始包大小
    - 配置别名提高代码可读性
    - 使用插件扩展功能

    对于大型项目，建议合理配置预构建和懒加载策略。`,
    author: "赵六",
    date: "2026-03-08",
    readTime: "9 分钟",
    tags: ["Vite", "构建工具", "前端工具链"],
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
  }
];
