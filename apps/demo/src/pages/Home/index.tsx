import { Link } from "react-router-dom";
import styles from "./index.module.less";
import { blogPosts } from "./data";

const Home = () => {
  return (
    <div className={styles.blogContainer}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}> technify 博客 </h1>
        <p className={styles.heroSubtitle}>分享前端开发、编程技术和技术思考</p>
        <Link to="/posts" className={styles.exploreButton}>
          浏览所有文章
        </Link>
      </header>

      {/* Featured Posts */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>最新文章</h2>
        <div className={styles.postGrid}>
          {blogPosts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <div className={styles.postImageContainer}>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className={styles.postImage}
                  loading="lazy"
                />
              </div>
              <div className={styles.postContent}>
                <div className={styles.postMeta}>
                  <span className={styles.postDate}>{post.date}</span>
                  <span className={styles.postReadTime}>· {post.readTime}</span>
                </div>
                <h3 className={styles.postTitle}>
                  <Link to={`/posts/${post.id}`} className={styles.postLink}>
                    {post.title}
                  </Link>
                </h3>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <div className={styles.postTags}>
                  {post.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={styles.postAuthor}>
                  <span>by {post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <h2 className={styles.sectionTitle}>关于本站</h2>
        <p className={styles.aboutContent}>
          technify 是一个分享前端开发技术和编程经验的个人博客。我们致力于
          提供高质量的技术内容，帮助开发者成长和进步。内容涵盖 React、
          TypeScript、CSS、构建工具等多个领域。
        </p>
      </section>
    </div>
  );
};

export default Home;
