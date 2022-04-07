type WindowControlsOverlayEvent = Event & {
  titlebarAreaRect: DOMRectReadOnly;
};

interface Navigator {
  windowControlsOverlay: HTMLDivElement & {
    getTitlebarAreaRect: () => DOMRect;
    visible: boolean;
    ongeometrychange: (event: WindowControlsOverlayEvent) => void;
    addEventListener: (
      event: 'geometrychange',
      listener: (evt: WindowControlsOverlayEvent) => void
    ) => void;

    removeEventListener: (
      event: 'geometrychange',
      listener: (evt: WindowControlsOverlayEvent) => void
    ) => void;
  };
}
