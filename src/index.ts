export * from "./types";

import Reconciler from "react-reconciler";
import { ReactNode } from "react";
import { renderer } from "./renderer";
import type { StreamDeckContainer, StreamDeckElements } from "./types";

const reconciler = Reconciler(renderer);

export { StreamDeckElements };

export default {
  render(element: ReactNode, deck: StreamDeckContainer) {
    const container = reconciler.createContainer(
      deck,
      0,
      null,
      true,
      null,
      "streamdeck",
      (err) => console.error(err),
      null,
    );
    reconciler.updateContainer(element, container, null, null);
  },
};
