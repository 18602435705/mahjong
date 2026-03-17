import styles from './index.module.less';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.hero}>
        <h1 className={styles.title}>欢迎来到手机商城</h1>
        <p className={styles.subtitle}>发现最新、最热门的智能手机</p>
        <button className={styles.ctaButton}>开始探索</button>
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📱</div>
          <h3 className={styles.featureTitle}>精选手机</h3>
          <p className={styles.featureDescription}>汇集全球顶尖品牌最新款智能手机</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>💰</div>
          <h3 className={styles.featureTitle}>超值价格</h3>
          <p className={styles.featureDescription}>优质价格，让您的每一分钱都物有所值</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🚚</div>
          <h3 className={styles.featureTitle}>快速配送</h3>
          <p className={styles.featureDescription}>全国包邮，快速到达您的手中</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🔒</div>
          <h3 className={styles.featureTitle}>品质保证</h3>
          <p className={styles.featureDescription}>正品保证，售后服务无忧</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
