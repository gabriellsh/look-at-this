import { MAX_OUTPUT_WIDTH, SEGMENTATION_WIDTH } from './config.js';

const hasCanvasFilter = 'filter' in CanvasRenderingContext2D.prototype;

const sourceSize = (el) =>
  el instanceof HTMLVideoElement ? [el.videoWidth, el.videoHeight] : [el.naturalWidth, el.naturalHeight];

function drawCover(ctx, img, W, H) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const s = Math.max(W / iw, H / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

// Canvas 2D compositor for one source. Holds the smoothed mask, so a new source (or a new
// segmenter, via resetMask) starts from a clean slate.
export function createCompositor(out) {
  const ctx = out.getContext('2d');
  const fg = document.createElement('canvas');
  const fgCtx = fg.getContext('2d');
  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d');
  const small = document.createElement('canvas');
  const smallCtx = small.getContext('2d');
  const segInput = document.createElement('canvas');
  const segInputCtx = segInput.getContext('2d');

  let smooth = null;
  let maskImage = null;
  let maskW = 0;
  let maskH = 0;

  // Output keeps the source aspect ratio, capped at MAX_OUTPUT_WIDTH. Returns false until the
  // source has dimensions (video metadata not loaded yet).
  function fit(el) {
    const [w, h] = sourceSize(el);
    if (!w || !h) return false;
    const scale = Math.min(1, MAX_OUTPUT_WIDTH / w);
    const W = Math.round(w * scale);
    const H = Math.round(h * scale);
    if (out.width !== W || out.height !== H) {
      out.width = fg.width = W;
      out.height = fg.height = H;
    }
    return true;
  }

  // MediaPipe returns masks at the resolution of the frame it was given, not the model's, so a
  // 720p frame would mean a 720p GPU readback and per-pixel loop. The model resizes its input to
  // 256 px anyway, so hand it a frame that size and upscale the mask when compositing.
  function segmentationInput(el) {
    const [w, h] = sourceSize(el);
    const W = Math.min(w, SEGMENTATION_WIDTH);
    const H = Math.max(1, Math.round((h * W) / w));
    if (segInput.width !== W || segInput.height !== H) {
      segInput.width = W;
      segInput.height = H;
    }
    segInputCtx.drawImage(el, 0, 0, W, H);
    return segInput;
  }

  // Copies the mask out of MediaPipe (only valid inside the segment callback), applies the
  // temporal EMA and the edge smoothstep, and writes it to the mask canvas as alpha.
  function updateMask(mask, settings) {
    const raw = mask.getAsFloat32Array();
    if (!smooth || mask.width !== maskW || mask.height !== maskH) {
      maskW = maskCanvas.width = mask.width;
      maskH = maskCanvas.height = mask.height;
      smooth = Float32Array.from(raw);
      maskImage = maskCtx.createImageData(maskW, maskH);
    } else {
      const a = 1 - settings.smooth;
      for (let i = 0; i < raw.length; i++) smooth[i] += a * (raw[i] - smooth[i]);
    }

    const lo = 0.5 - settings.soft;
    const span = 2 * settings.soft;
    const px = maskImage.data;
    for (let i = 0, j = 0; i < smooth.length; i++, j += 4) {
      let t = (smooth[i] - lo) / span;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      px[j] = px[j + 1] = px[j + 2] = 255;
      px[j + 3] = t * t * (3 - 2 * t) * 255;
    }
    maskCtx.putImageData(maskImage, 0, 0);
  }

  function resetMask() {
    smooth = null;
  }

  function drawSource(c, el, W, H, mirror, filter) {
    c.save();
    if (mirror) {
      c.translate(W, 0);
      c.scale(-1, 1);
    }
    if (filter) c.filter = filter;
    c.drawImage(el, 0, 0, W, H);
    c.restore();
  }

  // Same flip as drawSource, otherwise mask and frame would not line up.
  function drawMask(c, W, H, mirror, feather) {
    c.save();
    if (mirror) {
      c.translate(W, 0);
      c.scale(-1, 1);
    }
    if (hasCanvasFilter && feather > 0) c.filter = `blur(${feather}px)`;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(maskCanvas, 0, 0, W, H);
    c.restore();
  }

  function drawBlurred(el, W, H, mirror, px) {
    if (hasCanvasFilter) {
      drawSource(ctx, el, W, H, mirror, `blur(${px}px)`);
      return;
    }
    // Downscale-then-upscale blur for browsers without canvas filters (older Safari).
    const f = Math.max(2, px / 2);
    small.width = Math.max(1, Math.round(W / f));
    small.height = Math.max(1, Math.round(H / f));
    smallCtx.imageSmoothingEnabled = true;
    drawSource(smallCtx, el, small.width, small.height, mirror);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(small, 0, 0, W, H);
  }

  function render(el, settings, mirror, background) {
    const W = out.width;
    const H = out.height;
    ctx.clearRect(0, 0, W, H);

    if (settings.effect === 'none' || !smooth) {
      drawSource(ctx, el, W, H, mirror);
      return;
    }

    if (settings.effect === 'mask') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      drawMask(ctx, W, H, mirror, settings.feather);
      return;
    }

    if (settings.effect === 'blur') drawBlurred(el, W, H, mirror, settings.blur);
    else drawCover(ctx, background, W, H);

    fgCtx.globalCompositeOperation = 'source-over';
    fgCtx.clearRect(0, 0, W, H);
    drawMask(fgCtx, W, H, mirror, settings.feather);
    fgCtx.globalCompositeOperation = 'source-in';
    drawSource(fgCtx, el, W, H, mirror);
    fgCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(fg, 0, 0);
  }

  return {
    fit,
    segmentationInput,
    updateMask,
    resetMask,
    render,
    clear: () => ctx.clearRect(0, 0, out.width, out.height),
    maskSize: () => (smooth ? `${maskW}×${maskH}` : null),
  };
}
