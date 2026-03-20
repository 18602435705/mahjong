import { Link } from 'react-router-dom';
import styles from './index.module.less';

const NotFound = () => {
  return (
    <main className={styles.notFoundPage}>
      <div className={styles.gridMask} aria-hidden />
      <div className={`${styles.orb} ${styles.orbLeft}`} aria-hidden />
      <div className={`${styles.orb} ${styles.orbRight}`} aria-hidden />

      <section className={styles.card}>
        <p className={styles.statusCode}>404</p>
        <h1 className={styles.title}>页面暂时失联</h1>
        <p className={styles.description}>
          你访问的链接不存在，可能已移动或输入有误。返回首页继续浏览你感兴趣的内容。
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryAction}>
            回到首页
          </Link>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => window.history.back()}
          >
            返回上一页
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
