import AssistantPanel from "./components/AssistantPanel";
import TopBar from "./components/TopBar";
import styles from "./index.module.less";

const FigmaProduct = () => {
  return (
    <div className={styles.page}>
      <div className={styles.canvas}>
        <TopBar />
        <main className={styles.mainArea}>
          <section className={styles.monitorArea}>
            <div className={styles.curveBoard} />
            <div className={styles.statusBoard} />
          </section>
          <AssistantPanel />
        </main>
      </div>
    </div>
  );
};

export default FigmaProduct;
