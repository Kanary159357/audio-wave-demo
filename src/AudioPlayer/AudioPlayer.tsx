import { useEffect, useRef, useState } from "preact/hooks";
import { memo } from "preact/compat";

import {
  getAudioBufferFromResponse,
  getAudioData,
  normalizePeak,
} from "./utils";
import { useCanvas } from "./useCanvas";
import { AudioCanvasDrawer } from "./AudioCanvasDrawer";

const blockWidth = 3;

function AudioPlayer({
  body,
  canvasWidth = 800,
  canvasHeight = 400,
}: {
  canvasHeight?: number;
  canvasWidth?: number;
  body: Response;
}) {
  const drawWaveForm = (ctx: CanvasRenderingContext2D) => {
    if (!audioRef.current || !ctx || !audioData) return;

    const { duration, currentTime } = audioRef.current;
    canvasDrawer.clearCanvas();
    canvasDrawer.drawBlocks({ blockList: audioData });
    canvasDrawer.drawProgressBlocks({ duration, currentTime });
  };

  const canvasRef = useCanvas(canvasWidth, canvasHeight, drawWaveForm);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioData, setAudioData] = useState<number[]>();
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasDrawer = new AudioCanvasDrawer({
    canvasRef,
    blockList: audioData ?? [],
    blockWidth: 3,
  });

  useEffect(() => {
    (async () => {
      const buffer = await getAudioBufferFromResponse(body);
      const audioData = await getAudioData({
        buffer,
        blockCnt: canvasWidth / blockWidth,
      });
      setAudioSrc(body);
      setAudioData(normalizePeak(audioData));
    })();

    async function setAudioSrc(response: Response) {
      if (!audioRef.current) return;
      const blob = await response.clone().blob();
      audioRef.current.src = URL.createObjectURL(blob);
    }
  }, [body, canvasWidth]);

  const handleClickCanvas = (e: MouseEvent) => {
    if (e.target instanceof HTMLCanvasElement) {
      if (!audioRef.current) return;
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      console.log(x / canvasWidth);
      const seekTime = Math.max(
        0,
        audioRef.current.duration * (x / canvasWidth)
      );
      audioRef.current.currentTime = seekTime;
    }
  };

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

      <audio ref={audioRef} loop />
      <button onClick={isPlaying ? stopAudio : playAudio}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}

export default memo(AudioPlayer);
