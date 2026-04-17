import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  applyPreferredOrientation,
  getCurrentOrientationMode,
  isOrientationMatched,
  type OrientationMode,
} from "./screenOrientation";
import "./RouteOrientationManager.css";

function isGameRoute(pathname: string) {
  return pathname.startsWith("/game");
}

function useOrientationMode() {
  const [mode, setMode] = useState<OrientationMode>(() =>
    getCurrentOrientationMode(),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(orientation: portrait)");

    const updateMode = () => {
      setMode(media.matches ? "portrait" : "landscape");
    };

    updateMode();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateMode);
    } else {
      media.addListener(updateMode);
    }

    if (window.screen.orientation) {
      window.screen.orientation.addEventListener("change", updateMode);
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", updateMode);
      } else {
        media.removeListener(updateMode);
      }

      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener("change", updateMode);
      }
    };
  }, []);

  return mode;
}

export default function RouteOrientationManager({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const mode = useOrientationMode();
  console.log("🚀 ~ RouteOrientationManager ~ mode:", mode)

  const preferredMode = useMemo<OrientationMode>(
    () => (isGameRoute(location.pathname) ? "landscape" : "portrait"),
    [location.pathname],
  );

  useEffect(() => {
    void applyPreferredOrientation(preferredMode, {
      allowFullscreen: preferredMode === "landscape",
      exitFullscreenAfterLock: preferredMode === "portrait",
    });
  }, [preferredMode]);

  const gameNeedsRotate =
    preferredMode === "landscape" && !isOrientationMatched("landscape");
  const portraitNeedsRotate =
    preferredMode === "portrait" && mode !== "portrait";

  return (
    <>
      {children}
      {gameNeedsRotate ? (
        <div className="orientation-mask" role="status" aria-live="polite">
          <div className="orientation-card">
            <h2>请旋转到横屏</h2>
            <p>当前对局页面建议横屏体验。若未自动旋转，请手动旋转设备。</p>
          </div>
        </div>
      ) : null}
      {portraitNeedsRotate ? (
        <div className="orientation-banner">当前页面建议竖屏浏览</div>
      ) : null}
    </>
  );
}
