import { useEffect, useRef } from "preact/hooks";

export const useCanvas = (
  canvasWidth: number,
  canvasHeight: number,
  animate: (ctx: CanvasRenderingContext2D) => void
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const initiateCanvas = () => {
      const dpr = window.devicePixelRatio ?? 1;

      if (!canvas || !ctx) return;
      canvas.width = Math.floor(canvasWidth * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      ctx.scale(dpr, dpr);
    };

    initiateCanvas();

    let animateId: number;

    const requestAnimation = () => {
      animateId = requestAnimationFrame(requestAnimation);

      if (ctx) {
        animate(ctx);
      }
    };

    requestAnimation();

    return () => cancelAnimationFrame(animateId);
  }, [canvasHeight, canvasWidth, animate]);

  return canvasRef;
};
