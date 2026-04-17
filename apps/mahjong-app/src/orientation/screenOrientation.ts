// 提供横竖屏与全屏能力，供路由/页面动作调用。
// 与浏览器兼容相关的降级处理统一放在本文件中。
export type OrientationMode = "portrait" | "landscape";

interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

interface WebkitFullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
}

// SSR 保护：方向与全屏 API 仅在浏览器环境可用。
function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

// 通过媒体查询读取当前视口方向。
export function getCurrentOrientationMode(): OrientationMode {
  if (!isBrowserEnvironment()) {
    return "portrait";
  }

  return window.matchMedia("(orientation: portrait)").matches
    ? "portrait"
    : "landscape";
}

// 便捷判断：当前方向是否已匹配目标方向。
export function isOrientationMatched(target: OrientationMode) {
  return getCurrentOrientationMode() === target;
}

// 兼容标准与 WebKit 前缀的全屏状态读取。
export function isFullscreenActive() {
  if (!isBrowserEnvironment()) {
    return false;
  }

  const webkitDocument = document as WebkitFullscreenDocument;
  return Boolean(
    document.fullscreenElement || webkitDocument.webkitFullscreenElement,
  );
}

// 尝试调用 Orientation Lock API。
// 在不支持或被浏览器拒绝时返回 false。
export async function tryLockOrientation(
  target: OrientationMode,
): Promise<boolean> {
  if (!isBrowserEnvironment()) {
    return false;
  }

  const orientation = window.screen.orientation;
  if (!orientation || typeof orientation.lock !== "function") {
    return false;
  }

  try {
    await orientation.lock(target);
    return true;
  } catch {
    return false;
  }
}

// 请求进入全屏：优先标准 API，失败后回退 WebKit 前缀 API。
export async function tryRequestFullscreen(): Promise<boolean> {
  if (!isBrowserEnvironment()) {
    return false;
  }

  if (isFullscreenActive()) {
    return true;
  }

  const root = document.documentElement as WebkitFullscreenElement;

  try {
    if (typeof root.requestFullscreen === "function") {
      await root.requestFullscreen();
      return true;
    }
  } catch {
    // no-op
  }

  try {
    if (typeof root.webkitRequestFullscreen === "function") {
      await root.webkitRequestFullscreen();
      return true;
    }
  } catch {
    // no-op
  }

  return isFullscreenActive();
}

// 退出全屏：优先标准 API，失败后回退 WebKit 前缀 API。
export async function tryExitFullscreen(): Promise<void> {
  if (!isBrowserEnvironment()) {
    return;
  }

  if (!isFullscreenActive()) {
    return;
  }

  const webkitDocument = document as WebkitFullscreenDocument;

  try {
    if (typeof document.exitFullscreen === "function") {
      await document.exitFullscreen();
      return;
    }
  } catch {
    // no-op
  }

  try {
    if (typeof webkitDocument.webkitExitFullscreen === "function") {
      await webkitDocument.webkitExitFullscreen();
    }
  } catch {
    // no-op
  }
}

// 游戏场景：尝试进入全屏并锁定到横屏。
export async function tryEnterFullscreenAndLockLandscape(): Promise<void> {
  await tryRequestFullscreen();
  await tryLockOrientation("landscape");
}

// 非游戏场景：尝试退出全屏并锁定到竖屏。
export async function tryExitFullscreenAndLockPortrait(): Promise<void> {
  await tryExitFullscreen();
  await tryLockOrientation("portrait");
}
