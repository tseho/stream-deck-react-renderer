import sharp from "sharp";
import hexToRgb from "../utils/hexToRgb";
import type { StreamDeckContainer, StreamDeckElements } from "../types";

type Props = StreamDeckElements["lcdKey"];

export default class LcdKeyInstance {
  private onPressListener?: (index: number) => void;
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

  onPress(index: number) {
    if (index !== this.index || this.props.onPress === undefined) {
      return;
    }

    this.props.onPress();
  }

  async render(container: StreamDeckContainer) {
    this.container = container;

    if (!this.props.onPress && this.onPressListener) {
      this.container.off("down", this.onPressListener);
      this.onPressListener = undefined;
    }

    if (this.props.onPress && !this.onPressListener) {
      this.onPressListener = this.onPress.bind(this);
      this.container.on("down", this.onPressListener);
    }

    if (this.props.color) {
      this.container.fillKeyColor(this.index, ...hexToRgb(this.props.color));
      return;
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
    if (this.onPressListener) {
      this.container?.off("down", this.onPressListener);
    }
  }
}
