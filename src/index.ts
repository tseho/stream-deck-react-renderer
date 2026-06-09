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
      1,
      null,
      process.env.NODE_ENV === "development",
      null,
      "streamdeck",
      (err) => console.error(err),
      (err) => console.error(err),
      (err) => console.error(err),
      () => {},
    );
    reconciler.updateContainer(element, container, null, null);
  },
};
