import type { StreamDeckContainer, StreamDeckElements } from "../types";
import type StreamDeckButtonInstance from "./StreamDeckButtonInstance";

type Props = StreamDeckElements["stream-deck"];

export default class StreamDeckInstance {
  props: Props;
  buttons: Map<number, StreamDeckButtonInstance> = new Map();

  constructor(props: Props) {
    this.props = props;
  }

  addButton(button: StreamDeckButtonInstance) {
    this.buttons.set(button.index, button);
  }

  update(newProps: Partial<Props>) {
    this.props = { ...this.props, ...newProps };
  }

  clearButtons() {
    this.buttons.clear();
  }

  async render(container: StreamDeckContainer) {
    for (let index = 0; index < container.NUM_KEYS; index++) {
      const button = this.buttons.get(index);
      if (!button) {
        container.fillKeyColor(index, 0, 0, 0);
      } else {
        button.render(container);
      }
    }
  }

  unmount() {
    this.buttons.forEach((button) => button.unmount());
  }
}
