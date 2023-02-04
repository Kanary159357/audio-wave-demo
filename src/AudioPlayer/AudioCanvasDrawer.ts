import { RefObject } from "preact";

export interface AudioCanvasDrawerOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  blockList: number[];
  blockWidth?: number;
}

export class AudioCanvasDrawer {
  blockList: number[];
  canvasRef: RefObject<HTMLCanvasElement>;
  blockWidth: number;

  constructor(options: AudioCanvasDrawerOptions) {
    this.canvasRef = options.canvasRef;
    this.blockList = options.blockList;
    this.blockWidth = options.blockWidth ?? 5;
  }

  getPixelRatio() {
    return window.devicePixelRatio ?? 1;
  }

  getCanvasHeight() {
    if (this.canvasRef.current?.height) {
      return this.canvasRef.current.height / this.getPixelRatio();
    }

    return this.canvasRef.current?.height ?? 0;
  }

  getCanvasWidth() {
    if (this.canvasRef.current?.width) {
      return this.canvasRef.current.width / this.getPixelRatio();
    }
    return this.canvasRef.current?.width ?? 0;
  }

  clearCanvas() {
    if (!this.canvasRef || !this.canvasRef.current) return;
    const ctx = this.canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
  }

  drawProgressBlocks({
    currentTime,
    duration,
  }: {
    currentTime: number;
    duration: number;
  }) {
    if (!this.canvasRef || !this.canvasRef.current) return;
    const ctx = this.canvasRef.current.getContext("2d");
    if (!ctx) return;
    const currentBarX =
      duration === 0 ? 0 : (currentTime / duration) * this.getCanvasWidth();
    const currentList = this.blockList.slice(
      0,
      Math.ceil(currentBarX / this.blockWidth)
    );
    this.drawBlocks({
      blockList: currentList,
      fillColor: "gray",
    });

    ctx.beginPath();
    ctx.moveTo(currentBarX, this.getCanvasHeight());
    ctx.lineWidth = this.blockWidth * 2;
    ctx.strokeStyle = "red";
    ctx.lineTo(currentBarX, 0);
    ctx.stroke();
    ctx.closePath();
  }

  drawBlocks({
    strokeColor,
    fillColor,
    blockList,
  }: {
    strokeColor?: string;
    fillColor?: string;
    blockList: number[];
  }) {
    if (!this.canvasRef || !this.canvasRef.current) return;
    const ctx = this.canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = strokeColor ?? "blue";
    ctx.fillStyle = fillColor ?? "cyan";
    blockList.forEach((data, index) => {
      const x = this.blockWidth * index;
      ctx.fillRect(
        x,
        this.getCanvasHeight(),
        this.blockWidth,
        this.getCanvasHeight() * data * -1
      );
    });
  }
}
