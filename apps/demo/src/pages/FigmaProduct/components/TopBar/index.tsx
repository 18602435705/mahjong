import styles from "./index.module.less";
import publicControlIcon from "../../assets/a6afdff3-6260-4113-9c37-7880ca3ddbcf.png";
import studyToolIcon from "../../assets/2ace6f77-7b6f-4fe3-b212-d6ada5bf9314.png";
import warningIcon from "../../assets/f8a5183e-6ad2-46d8-b92d-6a0f0a59a298.png";

type NavItem = {
  label: string;
  icon: string;
  active: boolean;
};

const navItems: NavItem[] = [
  { label: "公屏控制", icon: publicControlIcon, active: false },
  { label: "辅学工具", icon: studyToolIcon, active: true },
  { label: "异常告警", icon: warningIcon, active: false },
];

const TopBar = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.contentRow}>
          <div className={styles.passcode}>
            本场签到口令：<span className={styles.passcodeValue}>5668</span>
          </div>

          <div className={styles.viewSwitch}>
            <button type="button" className={styles.viewButton}>
              曲线监测视图
            </button>
            <button type="button" className={styles.viewButton} data-active="true">
              学生状态视图
            </button>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <div
                key={item.label}
                className={styles.navItem}
                data-active={item.active}
              >
                <img src={item.icon} alt="" aria-hidden className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.activeIndicator} aria-hidden />
      </div>
    </header>
  );
};

export default TopBar;
