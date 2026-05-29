import type { DeviceModelId, StreamDeck } from "@elgato-stream-deck/node";

export type StreamDeckContainer = StreamDeck;

export interface StreamDeckElements {
  "stream-deck": {
    model: DeviceModelId;
    children?: React.ReactNode;
  };
  "stream-deck-button": {
    position?: number;
    image?: string;
    onPress?: () => void;
    onLongPress?: () => void;
  };
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends StreamDeckElements {}
  }
}
