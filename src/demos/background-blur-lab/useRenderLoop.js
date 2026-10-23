import { useEffect, useRef } from 'react';
import { createCompositor } from './compositor.js';
import { STATS_INTERVAL_MS } from './config.js';

// Drives segmentation and compositing for the current source. Nothing per-frame goes through
// React state: settings are read from `settingsRef` (updated every render) and stats are pushed
// to `onStats` about twice a second.
//
// Video sources step on requestVideoFrameCallback when available (one pass per decoded frame);
// images, and browsers without it, step on requestAnimationFrame so slider changes still re-render.
export function useRenderLoop({ canvasRef, source, segmenterRef, settingsRef, onStats }) {
  const onStatsRef = useRef(onStats);
  onStatsRef.current = onStats;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!source || !canvas) return undefined;

    const { el, kind } = source;
    const compositor = createCompositor(canvas);
    const useVfc = el instanceof HTMLVideoElement && 'requestVideoFrameCallback' in el;

    let handle = 0;
    let stopped = false;
    let segmenterId = null;
    let infAvg = 0;
    let frames = 0;
    let windowStart = performance.now();

    const frame = () => {
      if (!compositor.fit(el)) return;
      const settings = settingsRef.current;
      const entry = segmenterRef.current;

      if (entry?.id !== segmenterId) {
        segmenterId = entry?.id ?? null;
        compositor.resetMask();
      }

      if (entry && settings.effect !== 'none') {
        // Timestamps must strictly increase per segmenter; the tracker lives on the entry so a
        // rebuilt segmenter starts fresh.
        let ts = performance.now();
        if (ts <= entry.lastTs) ts = entry.lastTs + 1;
        entry.lastTs = ts;

        const t0 = performance.now();
        try {
          entry.segmenter.segmentForVideo(compositor.segmentationInput(el), ts, (result) => {
            const mask = result.confidenceMasks?.[0];
            if (mask) compositor.updateMask(mask, settings);
          });
        } catch (err) {
          console.error(err);
        }
        const dt = performance.now() - t0;
        infAvg = infAvg ? infAvg * 0.9 + dt * 0.1 : dt;
      }

      compositor.render(el, settings, kind === 'camera' && settings.mirror, settings.background);

      frames++;
      const now = performance.now();
      if (now - windowStart >= STATS_INTERVAL_MS) {
        onStatsRef.current?.({
          fps: (frames * 1000) / (now - windowStart),
          inference: settings.effect === 'none' || !entry ? null : infAvg,
          maskSize: compositor.maskSize(),
        });
        frames = 0;
        windowStart = now;
      }
    };

    const schedule = () => {
      handle = useVfc ? el.requestVideoFrameCallback(step) : requestAnimationFrame(step);
    };
    const step = () => {
      if (stopped) return;
      frame();
      schedule();
    };
    schedule();

    return () => {
      stopped = true;
      if (useVfc) el.cancelVideoFrameCallback(handle);
      else cancelAnimationFrame(handle);
      compositor.clear();
      onStatsRef.current?.(null);
    };
  }, [canvasRef, source, segmenterRef, settingsRef]);
}
