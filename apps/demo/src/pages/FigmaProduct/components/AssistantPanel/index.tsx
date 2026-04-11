import styles from "./index.module.less";
import selectedCheckBg from "../../assets/988d0095-2479-4d86-8e77-f4419e84d057.png";
import unselectedCheckBg from "../../assets/a87ff12e-6fe3-426a-8042-b22d54b75251.png";
import checkIcon from "../../assets/559c90a3-dfb4-4523-8c7b-a4e3072677c1.png";
import studentAvatar from "../../assets/cdbad778-d19e-444c-bd6c-db1a8f8e75bc.png";

type ToolItem = {
  label: string;
  active: boolean;
};

type StudentItem = {
  id: number;
  name: string;
  selected: boolean;
};

const toolItems: ToolItem[] = [
  { label: "抽卡水晶", active: true },
  { label: "积分奖励", active: false },
  { label: "公屏鼓励", active: false },
];

const selectedStudentIds = new Set([1, 4]);

const students: StudentItem[] = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  name: "黄俊杰",
  selected: selectedStudentIds.has(index + 1),
}));

const AssistantPanel = () => {
  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>辅学工具</h2>
      <p className={styles.subtitle}>请选择需要使用的辅学工具</p>

      <div className={styles.toolTabs}>
        {toolItems.map((tool) => (
          <button
            key={tool.label}
            type="button"
            className={styles.toolTab}
            data-active={tool.active}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <p className={styles.studentHeading}>选择需要使用辅学工具的学生</p>

      <ul className={styles.studentList}>
        {students.map((student) => (
          <li key={student.id} className={styles.studentItem}>
            <span className={styles.checkWrap}>
              <img
                src={student.selected ? selectedCheckBg : unselectedCheckBg}
                alt=""
                aria-hidden
                className={styles.checkBg}
              />
              {student.selected ? (
                <img src={checkIcon} alt="" aria-hidden className={styles.checkIcon} />
              ) : null}
            </span>
            <img
              src={studentAvatar}
              alt={`${student.name}头像`}
              className={styles.avatar}
            />
            <span className={styles.studentName}>{student.name}</span>
          </li>
        ))}
      </ul>

      <button type="button" className={styles.confirmButton}>
        确定
      </button>
    </aside>
  );
};

export default AssistantPanel;
