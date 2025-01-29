import type { StreamDeck } from "@elgato-stream-deck/node";

export type StreamDeckContainer = StreamDeck;

export interface StreamDeckElements {
  lcdKey: {
    position?: number;
    image?: string;
    color?: string;
    onPress?: () => void;
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends StreamDeckElements {}
  }
}
