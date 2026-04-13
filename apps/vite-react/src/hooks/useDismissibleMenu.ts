import { useEffect, type RefObject } from "react";

const KEYBOARD = {
  ESCAPE: "Escape",
} as const;
const WINDOW_EVENT = {
  POINTER_DOWN: "pointerdown",
  KEY_DOWN: "keydown",
} as const;

/**
 * 在菜单打开时监听点击外部与 Esc 关闭菜单。
 */
export function useDismissibleMenu(
  menuOpen: boolean,
  menuRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD.ESCAPE) {
        onClose();
      }
    };

    window.addEventListener(WINDOW_EVENT.POINTER_DOWN, handlePointerDown);
    window.addEventListener(WINDOW_EVENT.KEY_DOWN, handleKeyDown);

    return () => {
      window.removeEventListener(WINDOW_EVENT.POINTER_DOWN, handlePointerDown);
      window.removeEventListener(WINDOW_EVENT.KEY_DOWN, handleKeyDown);
    };
  }, [menuOpen, menuRef, onClose]);
}
