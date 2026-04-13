import React, { useEffect, useMemo, useRef } from "react";
import { useTheme } from "../themes";
import { css } from "@emotion/react";

/**
 * Draws a canvas with lines and time stamps for orientation on a timeline
 *
 * Unlike the waveform or timeline segments, the canvas is not stretched but
 * redrawn to fit the current section (to avoid an extremely large canvas
 * that kills the browser buffer). As such this component cannot go into
 * a Scrollcontainer, but has to sit outside of it.
 */
const TimelineStamps: React.FC<{
  durationMs: number // full duration in ms
  zoomedWidth: number // width of scroll container contents (in px)
  scrollLeft: number // scrollContainerRef.current.scrollLeft
  visibleWidth: number // scrollContainerRef.current.clientWidth
  height?: number
}> = ({
  durationMs,
  zoomedWidth,
  scrollLeft,
  visibleWidth,
  height = 20,
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tickColor = useMemo(
    () => resolveCssVar(theme.metadata_highlight),
    [theme.metadata_highlight],
  );
  const textColor = useMemo(
    () => resolveCssVar(theme.text),
    [theme.text],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    };

    const dpr = window.devicePixelRatio || 1;

    canvas.width = visibleWidth * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${visibleWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(ctx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs, zoomedWidth, scrollLeft, visibleWidth, height]);

  // Numbers to display
  const intervalsMs = [
    10, 20, 50,
    100, 200, 500,
    1000, 2000, 5000,
    10000, 15000, 30000,
    60000, 120000, 300000,
  ];

  const chooseInterval = (pxPerMs: number) => {
    for (const i of intervalsMs) {
      if (i * pxPerMs >= 80) {
        return i;
      }
    }
    return intervalsMs[intervalsMs.length - 1];
  };

  const formatTime = (ms: number, totalDurationMs: number) => {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");

    // Only show hours if the whole timeline exceeds 1 hour
    if (totalDurationMs >= 3600_000) {
      const hh = hours.toString().padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    }

    return `${mm}:${ss}`;
  };


  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, visibleWidth, height);

    const pixelsPerMs = zoomedWidth / durationMs;

    const startMs = scrollLeft / pixelsPerMs;
    const endMs = (scrollLeft + visibleWidth) / pixelsPerMs;

    const interval = chooseInterval(pixelsPerMs);

    const firstTick = Math.floor(startMs / interval) * interval;

    ctx.strokeStyle = tickColor;
    ctx.fillStyle = textColor;

    for (let t = firstTick; t <= endMs; t += interval) {
      const x = (t - startMs) * pixelsPerMs;

      const isMajor = Math.round(t / interval) % 5 === 0;

      ctx.beginPath();
      ctx.moveTo(x + 0.5, height);
      ctx.lineTo(x + 0.5, height - (isMajor ? 18 : 10));
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(formatTime(t, durationMs), x + 4, 14);
      }
    }
  };

  return <canvas ref={canvasRef}
    css={css({ zIndex: 10 })}
  />;
};

function resolveCssVar(value: string): string {
  if (!value.startsWith("var(")) {
    return value;
  }

  const name = value.slice(4, -1).trim(); // --neutral-10

  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}


export default TimelineStamps;
