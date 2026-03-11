import React, { useState, useEffect } from 'react';
import './Blog.css';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  readTime: number;
  category: string;
  featured: boolean;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const mockPosts: BlogPost[] = [
        {
          id: 1,
          title: '探索前端开发的新趋势',
          excerpt: '随着技术的不断演进，前端开发领域涌现出许多新的框架和工具。本文将探讨2023年最值得关注的几个趋势...',
          content: '在这篇详细的博客文章中，我们将深入探讨现代前端开发的各个方面，包括框架选择、性能优化和用户体验设计。',
          date: '2023-05-15',
          author: '张三',
          tags: ['前端', 'JavaScript', 'React'],
          readTime: 8,
          category: '技术',
          featured: true
        },
        {
          id: 2,
          title: '我的设计之旅：从零到专业',
          excerpt: '分享我从一名设计新手成长为专业设计师的心路历程。包括学习资源推荐和实用技巧...',
          content: '在这篇文章中，我将详细分享我的设计成长经历，包括遇到的挑战、获得的经验以及推荐的学习资源。',
          date: '2023-05-10',
          author: '李四',
          tags: ['设计', '经验', '教程'],
          readTime: 12,
          category: '设计',
          featured: true
        },
        {
          id: 3,
          title: '如何提高工作效率的小技巧',
          excerpt: '在快节奏的工作环境中，提高效率变得尤为重要。这里分享我个人总结的几个实用方法...',
          content: '本文将详细介绍各种提高工作效率的方法，包括时间管理、任务优先级设定和工作流程优化。',
          date: '2023-05-05',
          author: '王五',
          tags: ['效率', '时间管理', '工作'],
          readTime: 6,
          category: '生活',
          featured: false
        },
        {
          id: 4,
          title: 'React Hooks 的高级应用',
          excerpt: '深入探讨 React Hooks 中一些不太常用但非常强大的特性，以及它们在实际项目中的应用场景...',
          content: '在这篇技术文章中，我们将深入了解 React Hooks 的高级应用，包括自定义 Hooks 的创建和性能优化技巧。',
          date: '2023-04-28',
          author: '赵六',
          tags: ['React', 'Hooks', 'JavaScript'],
          readTime: 10,
          category: '技术',
          featured: false
        },
        {
          id: 5,
          title: '城市漫步：发现身边的美好',
          excerpt: '有时候我们需要放慢脚步，去发现身边那些被忽略的美好事物。记录下我的几次城市漫步体验...',
          content: '这篇文章将带您一起体验城市漫步的乐趣，分享我发现的有趣地点和美好瞬间。',
          date: '2023-04-20',
          author: '孙七',
          tags: ['生活', '摄影', '旅行'],
          readTime: 7,
          category: '生活',
          featured: false
        },
        {
          id: 6,
          title: 'CSS Grid vs Flexbox：选择指南',
          excerpt: '在布局设计中，Grid 和 Flexbox 各有优势。本文将帮助您在不同场景下做出最佳选择...',
          content: '深入比较 CSS Grid 和 Flexbox 的特点和适用场景，通过实例演示如何选择最合适的布局方案。',
          date: '2023-04-15',
          author: '周八',
          tags: ['CSS', '布局', '前端'],
          readTime: 9,
          category: '技术',
          featured: true
        }
      ];
      setPosts(mockPosts);
      setFilteredPosts(mockPosts);
      setLoading(false);
    }, 800);
  }, []);

  const categories = ['all', ...new Set(posts.map(post => post.category))];

  // 处理搜索和筛选
  useEffect(() => {
    let result = posts;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      result = result.filter(post => post.category === selectedCategory);
    }

    // 按搜索词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(result);
  }, [selectedCategory, searchQuery, posts]);

  const featuredPosts = posts.filter(post => post.featured);

  return (
    <div className="blog-container">
      {/* 创意头部 */}
      <header className="creative-header">
        <div className="header-content">
          <h1 className="blog-title">🎨 创意角落</h1>
          <p className="blog-subtitle">在这里，分享灵感、创意与思考</p>

          <div className="header-actions">
            <button className="header-btn">📝 写新文章</button>
            <button className="header-btn">👥 关注</button>
          </div>
        </div>

        <div className="header-decorations">
          <div className="shape shape-1">✨</div>
          <div className="shape shape-2">🌈</div>
          <div className="shape shape-3">🎭</div>
        </div>
      </header>

      {/* 搜索和分类 */}
      <div className="blog-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? '全部' :
               category === '技术' ? '💻 技术' :
               category === '设计' ? '🎨 设计' :
               '生活方式'}
            </button>
          ))}
        </div>
      </div>

      {/* 特色文章展示 */}
      {featuredPosts.length > 0 && (
        <section className="featured-posts">
          <h2 className="section-title">🌟 精选文章</h2>
          <div className="featured-grid">
            {featuredPosts.slice(0, 3).map(post => (
              <article key={post.id} className="featured-card">
                <div className="featured-content">
                  <div className="featured-tag">{post.category}</div>
                  <h3 className="featured-title">{post.title}</h3>
                  <p className="featured-excerpt">{post.excerpt}</p>

                  <div className="post-meta">
                    <span className="post-date">📅 {post.date}</span>
                    <span className="read-time">⏱️ {post.readTime}分钟</span>
                  </div>

                  <div className="tags-container">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="post-tag">{tag}</span>
                    ))}
                  </div>

                  <button className="read-more-btn">📖 阅读全文</button>
                </div>

                <div className="featured-image-placeholder">
                  <div className="color-block"></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 文章列表 */}
      <section className="blog-posts">
        <h2 className="section-title">
          {selectedCategory === 'all' ? '📚 所有文章' :
           selectedCategory === '技术' ? '💻 技术文章' :
           selectedCategory === '设计' ? '🎨 设计文章' :
           '生活文章'}
          <span className="post-count">({filteredPosts.length})</span>
        </h2>

        {loading ? (
          <div className="loading">载入中...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="no-results">没有找到匹配的文章</div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-category">{post.category}</div>
                  <div className="post-featured-indicator">{post.featured ? '🌟' : ''}</div>
                </div>

                <div className="post-body">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>

                  <div className="post-footer">
                    <div className="post-meta">
                      <span className="post-author">👤 {post.author}</span>
                      <span className="post-date">📅 {post.date}</span>
                      <span className="read-time">⏱️ {post.readTime}分钟</span>
                    </div>

                    <div className="tags-container">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="post-tag">{tag}</span>
                      ))}
                    </div>

                    <button className="read-more-btn">📖 阅读全文</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 侧边栏 */}
      <aside className="blog-sidebar">
        <div className="sidebar-widget">
          <h3 className="widget-title">📈 热门标签</h3>
          <div className="popular-tags">
            <span className="tag-cloud">React</span>
            <span className="tag-cloud">JavaScript</span>
            <span className="tag-cloud">设计</span>
            <span className="tag-cloud">效率</span>
            <span className="tag-cloud">CSS</span>
            <span className="tag-cloud">前端</span>
          </div>
        </div>

        <div className="sidebar-widget">
          <h3 className="widget-title">📋 最近文章</h3>
          <ul className="recent-posts">
            {posts.slice(0, 5).map(post => (
              <li key={post.id} className="recent-post-item">
                <a href="#" className="recent-post-link">{post.title}</a>
                <span className="recent-post-date">{post.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-widget">
          <h3 className="widget-title">💌 订阅更新</h3>
          <div className="subscribe-form">
            <input type="email" placeholder="输入您的邮箱" className="email-input" />
            <button className="subscribe-btn">订阅</button>
          </div>
          <p className="subscribe-desc">不错过任何一篇精彩内容</p>
        </div>
      </aside>
    </div>
  );
};

export default Blog;