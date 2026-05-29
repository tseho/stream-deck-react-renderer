import sharp from "sharp";
import type { StreamDeckContainer, StreamDeckElements } from "../types";

type Props = StreamDeckElements["stream-deck-button"];

const LONG_PRESS_MS = 500;

export default class StreamDeckButtonInstance {
  private onPressListener?: (index: number) => void;
  private onUpListener?: (index: number) => void;
  private longPressTimer?: NodeJS.Timeout;
  container?: StreamDeckContainer;
  props: Props;
  index: number;

  constructor(props: Props, index: number) {
    this.props = props;
    this.index = index;
  }

  update(newProps: Partial<Props>) {
    this.props = {
      ...this.props,
      ...newProps,
    };
  }

  private handleDown(index: number) {
    if (index !== this.index) return;

    if (this.props.onLongPress) {
      this.longPressTimer = setTimeout(() => {
        this.longPressTimer = undefined;
        this.props.onLongPress!();
      }, LONG_PRESS_MS);
    } else if (this.props.onPress) {
      this.props.onPress();
    }
  }

  private handleUp(index: number) {
    if (index !== this.index) return;

    if (this.longPressTimer !== undefined) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
      this.props.onPress?.();
    }
  }

  async render(container: StreamDeckContainer) {
    this.container = container;

    const needsUpListener = !!this.props.onLongPress;
    const needsDownListener = !!(this.props.onPress || this.props.onLongPress);

    if (!needsDownListener && this.onPressListener) {
      this.container.off("down", this.onPressListener);
      this.onPressListener = undefined;
    }

    if (needsDownListener && !this.onPressListener) {
      this.onPressListener = this.handleDown.bind(this);
      this.container.on("down", this.onPressListener);
    }

    if (!needsUpListener && this.onUpListener) {
      this.container.off("up", this.onUpListener);
      this.onUpListener = undefined;
    }

    if (needsUpListener && !this.onUpListener) {
      this.onUpListener = this.handleUp.bind(this);
      this.container.on("up", this.onUpListener);
    }

    if (this.props.image) {
      const img = await sharp(this.props.image)
        .flatten()
        .resize(this.container.ICON_SIZE, this.container.ICON_SIZE)
        .raw()
        .toBuffer();

      this.container.fillKeyBuffer(this.index, img).catch(console.error);
    }
  }

  unmount() {
    if (this.longPressTimer !== undefined) {
      clearTimeout(this.longPressTimer);
    }
    if (this.onPressListener) {
      this.container?.off("down", this.onPressListener);
    }
    if (this.onUpListener) {
      this.container?.off("up", this.onUpListener);
    }
  }
}
