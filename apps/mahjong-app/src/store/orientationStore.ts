import { create } from "zustand";
import {
  getCurrentOrientationMode,
  isFullscreenActive,
} from "../orientation/screenOrientation";

type OrientationStoreState = {
  isFullscreen: boolean;
  isLandscape: boolean;
  setScreenState: (nextState: {
    isFullscreen: boolean;
    isLandscape: boolean;
  }) => void;
};

/**
 * 全局屏幕状态：维护当前是否全屏、是否横屏。
 */
export const useOrientationStore = create<OrientationStoreState>((set) => ({
  isFullscreen: isFullscreenActive(),
  isLandscape: getCurrentOrientationMode() === "landscape",
  setScreenState: (nextState) =>
    set({
      isFullscreen: nextState.isFullscreen,
      isLandscape: nextState.isLandscape,
    }),
}));
