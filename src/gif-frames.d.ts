// source https://github.com/benwiley4000/gif-frames/blob/master/gif-frames.d.ts
// https://github.com/benwiley4000/gif-frames/issues/21

declare module "gif-frames" {
  import {Initializer} from "multi-integer-range";

  export default function gifFrames<T extends GifFrameOptions>(options: T): Promise<GifFrameData<T>[]>;
  export default function gifFrames<T extends GifFrameOptions>(options: T, callback: (err: Error, frameData: GifFrameData<T>[]) => void): void;

  type GifOutputType = "jpeg" | "jpg" | "gif" | "png" | "canvas";
  type GifFrameData<T extends GifFrameOptions> = T["outputType"] extends "canvas" ? GifFrameCanvas : GifFrameReadableStream;

  interface GifFrameOptions {
      url: string | Buffer;
      frames: "all" | Initializer;
      outputType?: GifOutputType;
      quality?: number;
      cumulative?: boolean;
  }

  interface GifFrameCanvas {
      getImage(): HTMLCanvasElement;
      frameIndex: number;
      frameInfo: GifFrameInfo;
  }

  interface GifFrameReadableStream {
      getImage(): NodeJS.ReadableStream;
      frameIndex: number;
      frameInfo: GifFrameInfo;
  }

  interface GifFrameInfo {
      x: number;
      y: number;
      width: number;
      height: number;
      has_local_palette: boolean;
      palette_offset: number;
      palette_size: number;
      data_offset: number;
      data_length: number;
      transparent_index: number;
      interlaced: boolean;
      delay: number;
      disposal: number;
  }
}