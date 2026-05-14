import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  getCurrentOrientationMode,
  isFullscreenActive,
  tryEnterFullscreenAndLockLandscape,
  tryExitFullscreenAndLockPortrait,
} from "./screenOrientation";
import { useOrientationStore } from "../store/orientationStore";
import "./RouteOrientationManager.css";

function isGameRoute(pathname: string) {
  return pathname.startsWith("/game");
}

function RouteOrientation({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isGamePage = useMemo(
    () => isGameRoute(location.pathname),
    [location.pathname],
  );
  const isFullscreen = useOrientationStore((store) => store.isFullscreen);
  const isLandscape = useOrientationStore((store) => store.isLandscape);
  const setScreenState = useOrientationStore((store) => store.setScreenState);
  const [isRequestingFullscreen, setIsRequestingFullscreen] = useState(false);

  const syncScreenState = useCallback(() => {
    setScreenState({
      isFullscreen: isFullscreenActive(),
      isLandscape: getCurrentOrientationMode() === "landscape",
    });
  }, [setScreenState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(orientation: portrait)");

    const handleChange = () => {
      syncScreenState();
    };

    syncScreenState();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    const orientation = window.screen.orientation;
    if (orientation && typeof orientation.addEventListener === "function") {
      orientation.addEventListener("change", handleChange);
    }

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleChange as EventListener,
    );

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }

      if (
        orientation &&
        typeof orientation.removeEventListener === "function"
      ) {
        orientation.removeEventListener("change", handleChange);
      }

      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleChange as EventListener,
      );
    };
  }, [syncScreenState]);

  useEffect(() => {
    void (async () => {
      if (isGamePage) {
        await tryEnterFullscreenAndLockLandscape();
      } else {
        await tryExitFullscreenAndLockPortrait();
      }
    })();
  }, [isGamePage]);

  const handleEnterFullscreen = useCallback(async () => {
    if (isRequestingFullscreen) {
      return;
    }

    setIsRequestingFullscreen(true);

    try {
      await tryEnterFullscreenAndLockLandscape();
      syncScreenState();
    } finally {
      setIsRequestingFullscreen(false);
    }
  }, [isRequestingFullscreen, syncScreenState]);

  const showFullscreenPrompt = isGamePage && !isFullscreen;
  const showRotatePrompt = isGamePage && isFullscreen && !isLandscape;
  const showPortraitBanner = !isGamePage && isLandscape;

  return (
    <>
      {children}
      {showFullscreenPrompt ? (
        <div className="orientation-mask" role="status" aria-live="polite">
          <div className="orientation-card">
            <h2>请先全屏</h2>
            <p>当前对局页面建议全屏体验，点击按钮后会尝试自动切换横屏。</p>
            <button
              type="button"
              className="orientation-action-btn"
              disabled={isRequestingFullscreen}
              onClick={() => {
                void handleEnterFullscreen();
              }}
            >
              {isRequestingFullscreen ? "处理中..." : "进入全屏"}
            </button>
          </div>
        </div>
      ) : null}
      {showRotatePrompt ? (
        <div className="orientation-mask" role="status" aria-live="polite">
          <div className="orientation-card">
            <h2>请旋转到横屏</h2>
            <p>当前不是横屏，请主动旋转手机屏幕。</p>
          </div>
        </div>
      ) : null}
      {showPortraitBanner ? (
        <div className="orientation-banner">当前页面建议竖屏观看</div>
      ) : null}
    </>
  );
}

export default function RouteOrientationManager({
  children,
  enable = true,
}: {
  children: ReactNode;
  enable?: boolean;
}) {
  return enable ? <RouteOrientation>{children}</RouteOrientation> : children;
}
