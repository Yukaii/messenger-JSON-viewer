import { useEffect, useState } from 'react';

export default function useWindowOverlay() {
  const [windowControlsOverlayEnable, setWindowControlOverlay] =
    useState(false);
  const [windowControlsOverlayRect, setWindowControlOverlayRect] =
    useState<DOMRect | null>(null);

  useEffect(() => {
    if (!navigator['windowControlsOverlay']) {
      return;
    }

    const handler = (e: WindowControlsOverlayEvent) => {
      setWindowControlOverlay(navigator.windowControlsOverlay.visible);
      setWindowControlOverlayRect(e.titlebarAreaRect);
    };

    navigator.windowControlsOverlay.addEventListener('geometrychange', handler);

    handler({
      titlebarAreaRect: navigator.windowControlsOverlay.getTitlebarAreaRect(),
    } as WindowControlsOverlayEvent);

    return () => {
      navigator.windowControlsOverlay.removeEventListener(
        'geometrychange',
        handler
      );
    };
  }, []);

  return {
    windowControlsOverlayEnable,
    windowControlsOverlayRect,
  };
}
