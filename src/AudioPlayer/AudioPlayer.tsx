import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { memo } from "preact/compat";

import {
  getAudioBufferFromResponse,
  getAverageBlockList,
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
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const { duration, currentTime } = audioRef.current;

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
    blockWidth,
  });

  useEffect(() => {
    (async () => {
      const buffer = await getAudioBufferFromResponse(body);
      setAudioSrc(body);
      const audioData = await getAudioData(buffer);
      setAudioData(normalizePeak(audioData));
    })();

    async function getAudioData(buffer: AudioBuffer) {
      const rawData = buffer.getChannelData(0);
      const blockCnt = canvasWidth / blockWidth;
      const blockSize = Math.floor(rawData.length / blockCnt);
      const totalSamples = buffer.duration * blockCnt;

      return getAverageBlockList(totalSamples, blockSize, rawData);
    }

    async function setAudioSrc(response: Response) {
      if (!audioRef.current) return;
      const blob = await response.clone().blob();
      audioRef.current.src = URL.createObjectURL(blob);
    }
  }, [body, canvasWidth]);

  const handleClickCanvas = useCallback(
    (e: MouseEvent) => {
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
    },
    [canvasWidth]
  );

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
      {audioData && (
        <canvas
          width={canvasWidth}
          height={canvasHeight}
          ref={canvasRef}
          onClick={handleClickCanvas}
        />
      )}

      <audio ref={audioRef} loop />
      <button onClick={isPlaying ? stopAudio : playAudio}>
        {isPlaying ? "중지" : "재생"}
      </button>
    </div>
  );
}

export default memo(AudioPlayer);
