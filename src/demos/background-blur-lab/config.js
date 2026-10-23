// Injected by vite.config.js from the installed @mediapipe/tasks-vision package.
export const MEDIAPIPE_VERSION = __MEDIAPIPE_VERSION__;

export const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

const MODEL_ROOT = 'https://storage.googleapis.com/mediapipe-models/image_segmenter';

export const MODELS = {
  square: {
    label: '256×256',
    url: `${MODEL_ROOT}/selfie_segmenter/float16/latest/selfie_segmenter.tflite`,
  },
  landscape: {
    label: '144×256',
    url: `${MODEL_ROOT}/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite`,
  },
};

export const MODEL_CARD_URL =
  'https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf';

export const MAX_OUTPUT_WIDTH = 1280;

// Width of the frame handed to the segmenter (both models take 256 px on the long side).
export const SEGMENTATION_WIDTH = 256;

export const DEFAULTS = {
  effect: 'blur', // 'blur' | 'replace' | 'none' | 'mask'
  blur: 14,
  soft: 0.2,
  feather: 3,
  smooth: 0.5,
  mirror: true,
  model: 'square',
  delegate: 'GPU',
  bg: 'office',
};

export const STATS_INTERVAL_MS = 500;
