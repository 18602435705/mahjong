import { useEffect, useState, type ReactNode } from "react";
import styles from "./index.module.less";

// ═══════════════════════════════════════════════════════════════
// ICON COMPONENTS
// ═══════════════════════════════════════════════════════════════

const TrendingUpIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const DollarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ActivityIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// LOGO COMPONENT
// ═══════════════════════════════════════════════════════════════

const Logo = () => (
  <div className={styles.logoIcon}>
    <svg viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00FF9D" />
        </linearGradient>
      </defs>
      <path
        d="M20 4L6 12V28L20 36L34 28V12L20 4Z"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 10L12 14V22L20 26L28 22V14L20 10Z"
        fill="url(#logoGradient)"
      />
      <circle cx="20" cy="18" r="3" fill="#0A0A0F" />
    </svg>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? "nav-scrolled" : ""}`}>
      <div className={styles.navInner}>
        <a href="/" className={styles.logo}>
          <Logo />
          <span className={styles.logoText}>经济仪表盘</span>
        </a>
        <div className={styles.navLinks}>
          <a href="#overview" className={styles.navLink}>
            总览
          </a>
          <a href="#regions" className={styles.navLink}>
            区域数据
          </a>
          <a href="#indicators" className={styles.navLink}>
            经济指标
          </a>
          <a href="/" className={styles.navLink}>
            返回首页
          </a>
        </div>
      </div>
    </nav>
  );
};

// ═══════════════════════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════════════════════

interface EconomicIndicator {
  name: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: ReactNode;
}

interface RegionData {
  name: string;
  gdp: string;
  growth: number;
  inflation: number;
  unemployment: number;
}

interface TimeSeriesData {
  month: string;
  value: number;
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

const Hero = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot}></span>
          实时追踪全球 150+ 经济体
        </div>
        <h1 className={styles.heroTitle}>
          全球经济数据
          <br />
          <span className={styles.heroTitleAccent}>实时仪表盘</span>
        </h1>
        <p className={styles.heroSubtitle}>
          一站式监控全球主要经济指标，包括 GDP 增长率、通货膨胀率、失业率等关键数据，
          助您把握全球经济脉搏
        </p>
        <div className={styles.heroMeta}>
          <div className={styles.metaItem}>
            <CalendarIcon />
            <span>最后更新：{lastUpdated.toLocaleTimeString("zh-CN")}</span>
          </div>
          <button className={styles.refreshBtn} onClick={handleRefresh}>
            <RefreshIcon />
            <span>刷新数据</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// KEY INDICATORS SECTION
// ═══════════════════════════════════════════════════════════════

const KeyIndicators = () => {
  const indicators: EconomicIndicator[] = [
    {
      name: "全球 GDP 总量",
      value: "$105.3 万亿",
      change: 2.4,
      trend: "up",
      icon: <DollarIcon />,
    },
    {
      name: "平均通胀率",
      value: "4.2%",
      change: -0.8,
      trend: "down",
      icon: <ActivityIcon />,
    },
    {
      name: "全球失业率",
      value: "5.1%",
      change: -0.3,
      trend: "down",
      icon: <UsersIcon />,
    },
    {
      name: "就业率",
      value: "61.8%",
      change: 0.5,
      trend: "up",
      icon: <BriefcaseIcon />,
    },
  ];

  return (
    <section id="overview" className={styles.indicators}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>核心指标</span>
        <h2 className={styles.sectionTitle}>全球经济关键数据</h2>
      </div>
      <div className={styles.indicatorsGrid}>
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className={`${styles.indicatorCard} reveal`}
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className={styles.indicatorHeader}>
              <div className={styles.indicatorIcon}>{indicator.icon}</div>
              <div
                className={`${styles.indicatorTrend} ${
                  indicator.trend === "up"
                    ? styles.trendUp
                    : styles.trendDown
                }`}
              >
                {indicator.trend === "up" ? (
                  <TrendingUpIcon />
                ) : (
                  <TrendingDownIcon />
                )}
                <span>{Math.abs(indicator.change)}%</span>
              </div>
            </div>
            <div className={styles.indicatorValue}>{indicator.value}</div>
            <div className={styles.indicatorName}>{indicator.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// REGIONAL DATA SECTION
// ═══════════════════════════════════════════════════════════════

const RegionalData = () => {
  const regions: RegionData[] = [
    { name: "北美", gdp: "$27.4 万亿", growth: 2.1, inflation: 3.2, unemployment: 3.7 },
    { name: "欧盟", gdp: "$18.6 万亿", growth: 0.8, inflation: 2.9, unemployment: 6.1 },
    { name: "中国", gdp: "$17.8 万亿", growth: 5.2, inflation: 0.7, unemployment: 5.2 },
    { name: "日本", gdp: "$4.2 万亿", growth: 1.3, inflation: 3.1, unemployment: 2.6 },
    { name: "东南亚", gdp: "$3.8 万亿", growth: 4.5, inflation: 3.8, unemployment: 4.2 },
    { name: "其他", gdp: "$33.5 万亿", growth: 3.1, inflation: 5.4, unemployment: 7.8 },
  ];

  const chartData: TimeSeriesData[] = [
    { month: "1 月", value: 48.2 },
    { month: "2 月", value: 49.1 },
    { month: "3 月", value: 51.3 },
    { month: "4 月", value: 50.8 },
    { month: "5 月", value: 52.4 },
    { month: "6 月", value: 54.1 },
    { month: "7 月", value: 53.6 },
    { month: "8 月", value: 55.2 },
    { month: "9 月", value: 56.8 },
    { month: "10 月", value: 55.9 },
    { month: "11 月", value: 57.3 },
    { month: "12 月", value: 58.6 },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.value));

  return (
    <section id="regions" className={styles.regions}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>区域分析</span>
        <h2 className={styles.sectionTitle}>主要经济体表现</h2>
      </div>

      <div className={styles.regionsContainer}>
        <div className={styles.regionTable}>
          <div className={styles.tableHeader}>
            <div>经济体</div>
            <div>GDP 总量</div>
            <div>GDP 增长率</div>
            <div>通胀率</div>
            <div>失业率</div>
          </div>
          {regions.map((region, index) => (
            <div
              key={index}
              className={styles.tableRow}
            >
              <div className={styles.regionName}>{region.name}</div>
              <div className={styles.tableCell}>{region.gdp}</div>
              <div
                className={`${styles.tableCell} ${
                  region.growth >= 3
                    ? styles.positive
                    : region.growth < 1
                    ? styles.negative
                    : ""
                }`}
              >
                {region.growth >= 0 ? "+" : ""}
                {region.growth}%
              </div>
              <div
                className={`${styles.tableCell} ${
                  region.inflation > 4 ? styles.warning : ""
                }`}
              >
                {region.inflation}%
              </div>
              <div className={styles.tableCell}>{region.unemployment}%</div>
            </div>
          ))}
        </div>

        <div className={styles.chartPanel}>
          <div className={styles.chartHeader}>
            <h3>全球经济景气指数趋势</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot}></span>
                2024 年
              </span>
            </div>
          </div>
          <div className={styles.chart}>
            <div className={styles.chartGrid}>
              {[80, 60, 40, 20, 0].map((val) => (
                <div key={val} className={styles.gridLine}>
                  <span className={styles.gridLabel}>{val}</span>
                </div>
              ))}
            </div>
            <div className={styles.chartContent}>
              <svg viewBox="0 0 1200 400" className={styles.lineChart}>
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--cyan)"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--cyan)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0 ${400 - (chartData[0].value / maxVal) * 350} ${chartData
                    .map(
                      (d, i) =>
                        `L ${(i * 1200) / (chartData.length - 1)} ${
                          400 - (d.value / maxVal) * 350
                        }`
                    )
                    .join(" ")}`}
                  fill="url(#chartGradient)"
                  className={styles.chartArea}
                />
                <path
                  d={`M 0 ${400 - (chartData[0].value / maxVal) * 350} ${chartData
                    .map(
                      (d, i) =>
                        `L ${(i * 1200) / (chartData.length - 1)} ${
                          400 - (d.value / maxVal) * 350
                        }`
                    )
                    .join(" ")}`}
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="3"
                  className={styles.chartLine}
                />
                {chartData.map((d, i) => (
                  <circle
                    key={i}
                    cx={(i * 1200) / (chartData.length - 1)}
                    cy={400 - (d.value / maxVal) * 350}
                    r="6"
                    fill="var(--void)"
                    stroke="var(--cyan)"
                    strokeWidth="2"
                    className={styles.chartPoint}
                  />
                ))}
              </svg>
              <div className={styles.chartLabels}>
                {chartData.map((d, i) => (
                  <span key={i} className={styles.label}>
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// ECONOMIC INDICATORS SECTION
// ═══════════════════════════════════════════════════════════════

const EconomicIndicatorsSection = () => {
  const indicators = [
    {
      category: "制造业 PMI",
      items: [
        { name: "中国", value: "50.8", change: 0.3 },
        { name: "美国", value: "49.2", change: -0.5 },
        { name: "欧盟", value: "46.8", change: 0.2 },
        { name: "日本", value: "48.3", change: -0.8 },
      ],
    },
    {
      category: "消费者信心指数",
      items: [
        { name: "美国", value: "102.3", change: 1.2 },
        { name: "欧盟", value: "95.6", change: 2.1 },
        { name: "中国", value: "88.4", change: -0.5 },
        { name: "日本", value: "36.2", change: 0.8 },
      ],
    },
    {
      category: "基准利率",
      items: [
        { name: "美联储", value: "5.50%", change: 0 },
        { name: "欧洲央行", value: "4.50%", change: 0 },
        { name: "中国央行", value: "3.45%", change: -0.1 },
        { name: "日本央行", value: "-0.10%", change: 0.1 },
      ],
    },
  ];

  return (
    <section id="indicators" className={styles.indicatorsSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>详细指标</span>
        <h2 className={styles.sectionTitle}>分类经济数据</h2>
      </div>
      <div className={styles.indicatorsCards}>
        {indicators.map((category, catIndex) => (
          <div key={catIndex} className={styles.indicatorCategoryCard}>
            <h3 className={styles.categoryTitle}>{category.category}</h3>
            <div className={styles.categoryList}>
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.categoryItem}>
                  <span className={styles.itemName}>{item.name}</span>
                  <div className={styles.itemValue}>
                    <span className={styles.value}>{item.value}</span>
                    <span
                      className={`${styles.change} ${
                        item.change > 0
                          ? styles.changePositive
                          : item.change < 0
                          ? styles.changeNegative
                          : ""
                      }`}
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className={styles.footerCopy}>
          © 2024 全球经济数据仪表盘。数据来源：世界银行、IMF、各国统计局
        </p>
        <div className={styles.footerLinks}>
          <a href="#">数据说明</a>
          <a href="#">更新频率</a>
          <a href="#">API 接口</a>
          <a href="#">联系我们</a>
        </div>
      </div>
    </footer>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const GlobalEconomicDashboard = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={styles.gridBg}></div>
      <div className={styles.scanlines}></div>
      <Navigation />
      <main>
        <Hero />
        <KeyIndicators />
        <RegionalData />
        <EconomicIndicatorsSection />
      </main>
      <Footer />
    </>
  );
};

export default GlobalEconomicDashboard;
