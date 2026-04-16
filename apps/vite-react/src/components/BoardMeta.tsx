import "./BoardMeta.css";
import * as Popover from "@radix-ui/react-popover";
import * as Select from "@radix-ui/react-select";
import type {
  InitialDealPresetOption,
  InitialDealPresetId,
} from "../mahjongEngine";

type BoardMetaProps = {
  round: number;
  statusText: string;
  presetOptions: InitialDealPresetOption[];
  selectedPresetId: InitialDealPresetId;
  onPresetChange: (presetId: InitialDealPresetId) => void;
  onNextRound: () => void;
  onResetGame: () => void;
};

/**
 * 渲染顶部元信息区域：菜单、局数与状态文案。
 */
function BoardMeta(props: BoardMetaProps) {
  const {
    round,
    statusText,
    presetOptions,
    selectedPresetId,
    onPresetChange,
    onNextRound,
    onResetGame,
  } = props;

  return (
    <section className="board-meta">
      <div className="fab-menu">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className="menu-trigger" aria-label="菜单">
              ☰
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="menu-panel" sideOffset={8} align="start">
              <Popover.Close asChild>
                <button
                  type="button"
                  className="menu-item btn-main"
                  onClick={onNextRound}
                >
                  再来一局
                </button>
              </Popover.Close>
              <Popover.Close asChild>
                <button
                  type="button"
                  className="menu-item btn-sub"
                  onClick={onResetGame}
                >
                  重置积分
                </button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="meta-chip">第 {round} 局</div>
      <div className="meta-status" aria-live="polite">
        {statusText}
      </div>
      <div className="preset-picker">
        <span className="preset-label">牌局</span>
        <Select.Root
          value={selectedPresetId}
          onValueChange={(value) => onPresetChange(value as InitialDealPresetId)}
        >
          <Select.Trigger className="preset-select-trigger" aria-label="选择初始牌局预设">
            <Select.Value />
            <Select.Icon className="preset-select-icon">▾</Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="preset-select-content"
              position="popper"
              sideOffset={8}
              align="start"
            >
              <Select.Viewport className="preset-select-viewport">
                {presetOptions.map((option) => (
                  <Select.Item
                    key={option.id}
                    value={option.id}
                    className="preset-select-item"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="preset-select-item-indicator">
                      ✓
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </section>
  );
}

export default BoardMeta;
