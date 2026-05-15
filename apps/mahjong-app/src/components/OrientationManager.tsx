import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import screenfull from "screenfull";
import "./OrientationManager.css";

type Orientation = "portrait" | "landscape";

function getOrientation(): Orientation {
  if (typeof window === "undefined") return "landscape";
  return window.innerWidth < window.innerHeight ? "portrait" : "landscape";
}

type Props = {
  children: ReactNode;
};

/**
 * 横屏 + 全屏管理器：进入时自动全屏并锁定横屏。
 * 若自动全屏被浏览器拦截，则显示手动触发按钮。
 * 离开页面时自动退出全屏。
 */
export default function OrientationManager({ children }: Props) {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    getOrientation(),
  );
  const [needManualFullscreen, setNeedManualFullscreen] = useState(false);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);
  const isPortrait = orientation === "portrait";
  const mountedRef = useRef(false);

  const syncOrientation = useCallback(() => {
    setOrientation(getOrientation());
  }, []);

  // 进入时自动全屏，离开时退出全屏
  useEffect(() => {
    mountedRef.current = true;

    if (!screenfull.isEnabled) return;

    screenfull.request().catch(() => {
      if (mountedRef.current) setNeedManualFullscreen(true);
    });

    return () => {
      mountedRef.current = false;
      if (screenfull.isFullscreen) {
        screenfull.exit();
      }
    };
  }, []);

  // 监听全屏状态变化（用户可能通过手势退出全屏）
  useEffect(() => {
    if (!screenfull.isEnabled) return;

    function onFullscreenChange() {
      if (!screenfull.isFullscreen && mountedRef.current) {
        setNeedManualFullscreen(true);
      }
    }

    screenfull.on("change", onFullscreenChange);
    return () => {
      screenfull.off("change", onFullscreenChange);
    };
  }, []);

  // 监听方向变化
  useEffect(() => {
    window.addEventListener("resize", syncOrientation);
    window.addEventListener("orientationchange", syncOrientation);
    return () => {
      window.removeEventListener("resize", syncOrientation);
      window.removeEventListener("orientationchange", syncOrientation);
    };
  }, [syncOrientation]);

  // 全屏状态下尝试锁定横屏
  useEffect(() => {
    if (
      !isPortrait &&
      screenfull.isFullscreen &&
      screen.orientation?.lock
    ) {
      screen.orientation.lock("landscape").catch(() => {});
    }
  }, [isPortrait]);

  const handleEnterFullscreen = useCallback(async () => {
    if (!screenfull.isEnabled) return;
    try {
      await screenfull.request();
      setNeedManualFullscreen(false);
    } catch {
      setFullscreenFailed(true);
    }
  }, []);

  const showFullscreenBtn = needManualFullscreen && !fullscreenFailed;

  const fullscreenButton = showFullscreenBtn && !isPortrait && (
    <button
      type="button"
      className="orientation-manager__fullscreen-btn orientation-manager__fullscreen-btn--floating"
      onClick={handleEnterFullscreen}
    >
      尝试全屏
    </button>
  );

  if (!isPortrait) {
    return (
      <>
        {fullscreenButton}
        {children}
      </>
    );
  }

  return (
    <div className="orientation-manager">
      <div className="orientation-manager__content">{children}</div>
      <div className="orientation-manager__overlay">
        <div className="orientation-manager__hint">
          <svg
            className="orientation-manager__icon"
            viewBox="0 0 64 64"
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="8" y="18" width="48" height="28" rx="4" />
            <path d="M4 30h4M56 30h4" />
          </svg>
          <p>请旋转设备至横屏以获得最佳体验</p>
          {showFullscreenBtn && (
            <button
              type="button"
              className="orientation-manager__fullscreen-btn"
              onClick={handleEnterFullscreen}
            >
              尝试全屏
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
