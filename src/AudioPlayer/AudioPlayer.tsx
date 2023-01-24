import { useEffect, useRef, useState } from "preact/hooks";
import {
  getAudioBufferFromResponse,
  getAverageBlockList,
  normalizePeak,
} from "./utils";
import { RefObject } from "preact";

const blockWidth = 3;

export default function AudioPlayer({
  body,
  canvasWidth = 800,
  canvasHeight = 400,
}: {
  canvasHeight?: number;
  canvasWidth?: number;
  body: Response;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioData, setAudioData] = useState<number[]>();
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    (async () => {
      const buffer = await getAudioBufferFromResponse(body);
      setAudioSrc(body);
      const audioData = await getAudioData(buffer);
      setAudioData(normalizePeak(audioData));
    })();

    async function getAudioData(buffer: AudioBuffer) {
      const rawData = buffer.getChannelData(0);
      const blockCnt = canvasWidth / 3;
      const blockSize = Math.floor(rawData.length / blockCnt);
      const totalSamples = buffer.duration * blockCnt;

      return getAverageBlockList(totalSamples, blockSize, rawData);
    }

    async function setAudioSrc(response: Response) {
      if (!audioRef.current) return;
      const blob = await response.clone().blob();
      audioRef.current.src = URL.createObjectURL(blob);
    }
  }, []);

  const handleClickCanvas = (e: MouseEvent) => {
    if (e.target instanceof HTMLCanvasElement) {
      if (!audioRef.current) return;
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const seekTime = Math.max(
        0,
        audioRef.current.duration * (x / canvasWidth)
      );
      audioRef.current.currentTime = seekTime;
    }
  };
  useEffect(() => {
    function drawCanvas() {
      if (!audioRef || !audioRef.current) return;
      if (!canvasRef || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      const { currentTime, duration } = audioRef.current;
      if (!ctx) return;

      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
      const currentBarX = (currentTime / duration) * canvasWidth;
      // drawBackground(ctx);
      if (!audioData) return;
      drawBlocks({ blockList: audioData });
      drawProgressBlocks({ currentBarX, blockList: audioData });
      requestAnimationFrame(drawCanvas);
    }

    function drawProgressBlocks({
      blockList,
      currentBarX,
    }: {
      blockList: number[];
      currentBarX: number;
    }) {
      if (!audioRef || !audioRef.current) return;
      if (!canvasRef || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      const currentList = blockList.slice(
        0,
        Math.ceil(currentBarX / blockWidth)
      );
      drawBlocks({
        blockList: currentList,
        fillColor: "gray",
      });

      ctx.beginPath();
      ctx.moveTo(currentBarX, canvasHeight);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "blue";
      ctx.lineTo(currentBarX, 0);
      ctx.stroke();
      ctx.closePath();
    }

    function drawBlocks({
      strokeColor,
      fillColor,
      blockList,
    }: {
      strokeColor?: string;
      fillColor?: string;
      blockList: number[];
    }) {
      if (!audioRef || !audioRef.current) return;
      if (!canvasRef || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      let lastX = 0;
      ctx.strokeStyle = strokeColor ?? "blue";
      ctx.fillStyle = fillColor ?? "cyan";
      blockList.forEach((data, index) => {
        const x = blockWidth * index;
        ctx.fillRect(x, canvasHeight, blockWidth, canvasHeight * data * -1);
        lastX = x;
      });
    }

    drawCanvas();
  }, [audioData]);
  const playAudio = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };
  const stopAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  return (
    <div>
      {audioData && <canvas ref={canvasRef} onClick={handleClickCanvas} />}

      <audio ref={audioRef} loop></audio>
      <button onClick={isPlaying ? stopAudio : playAudio}>
        {isPlaying ? "중지" : "재생"}
      </button>
    </div>
  );
}

interface AudioCanvasOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  audioRef: RefObject<HTMLAudioElement>;
  blockList: number[];
}

class AudioCanvas {
  blockList: number[];
  audioRef: RefObject<HTMLAudioElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  canvasHeight: number;
  canvasWidth: number;
  constructor(options: AudioCanvasOptions) {
    this.canvasRef = options.canvasRef;
    this.audioRef = options.audioRef;
    this.blockList = options.blockList;
    this.canvasHeight = options.canvasRef.current?.height ?? 0;
    this.canvasWidth = options.canvasRef.current?.width ?? 0;
  }

  drawCanvas() {
    if (!this.audioRef || !this.audioRef.current) return;
    if (!this.canvasRef || !this.canvasRef.current) return;
    const ctx = this.canvasRef.current.getContext("2d");
    const { currentTime, duration } = this.audioRef.current;
    if (!ctx) return;

    this.canvasRef.current.width;
    this.canvasRef.current.height;
    const currentBarX = (currentTime / duration) * this.canvasWidth;
    // drawBackground(ctx);
    if (!this.blockList) return;
    this.drawBlocks({ blockList: this.blockList });
    this.drawProgressBlocks({ currentBarX, blockList: this.blockList });
    requestAnimationFrame(this.drawCanvas);
  }

  drawProgressBlocks({
    blockList,
    currentBarX,
  }: {
    blockList: number[];
    currentBarX: number;
  }) {
    if (!this.audioRef || !this.audioRef.current) return;
    if (!this.canvasRef || !this.canvasRef.current) return;
    const ctx = this.canvasRef.current.getContext("2d");
    if (!ctx) return;
    const currentList = blockList.slice(0, Math.ceil(currentBarX / blockWidth));
    this.drawBlocks({
      blockList: currentList,
      fillColor: "gray",
    });

    ctx.beginPath();
    ctx.moveTo(currentBarX, this.canvasHeight);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
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
    if (!this.audioRef || !this.audioRef.current) return;
    if (!this.canvasRef || !this.canvasRef.current) return;
    const ctx = this.canvasRef.current.getContext("2d");
    if (!ctx) return;

    let lastX = 0;
    ctx.strokeStyle = strokeColor ?? "blue";
    ctx.fillStyle = fillColor ?? "cyan";
    blockList.forEach((data, index) => {
      const x = blockWidth * index;
      ctx.fillRect(
        x,
        this.canvasHeight,
        blockWidth,
        this.canvasHeight * data * -1
      );
      lastX = x;
    });
  }
}
