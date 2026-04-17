export type OrientationMode = "portrait" | "landscape";

interface OrientationOptions {
  allowFullscreen?: boolean;
  exitFullscreenAfterLock?: boolean;
}

interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

interface WebkitFullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void> | void;
}

function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

export function getCurrentOrientationMode(): OrientationMode {
  if (!isBrowserEnvironment()) {
    return "portrait";
  }

  return window.matchMedia("(orientation: portrait)").matches
    ? "portrait"
    : "landscape";
}

export function isOrientationMatched(target: OrientationMode) {
  return getCurrentOrientationMode() === target;
}

async function tryLockOrientation(target: OrientationMode): Promise<boolean> {
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

async function tryRequestFullscreen(): Promise<boolean> {
  if (!isBrowserEnvironment()) {
    return false;
  }

  if (document.fullscreenElement) {
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

  return Boolean(document.fullscreenElement);
}

export async function tryExitFullscreen(): Promise<void> {
  if (!isBrowserEnvironment()) {
    return;
  }

  if (!document.fullscreenElement) {
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

export async function applyPreferredOrientation(
  target: OrientationMode,
  options: OrientationOptions = {},
): Promise<void> {
  const allowFullscreen = options.allowFullscreen ?? true;
  const exitFullscreenAfterLock = options.exitFullscreenAfterLock ?? false;

  let locked = await tryLockOrientation(target);

  if (!locked && allowFullscreen) {
    const enteredFullscreen = await tryRequestFullscreen();
    if (enteredFullscreen) {
      locked = await tryLockOrientation(target);
    }
  }

  if (target === "portrait") {
    if (typeof window !== "undefined" && window.screen.orientation?.unlock) {
      try {
        window.screen.orientation.unlock();
      } catch {
        // no-op
      }
    }

    if (exitFullscreenAfterLock || !locked) {
      await tryExitFullscreen();
    }
  }
}
