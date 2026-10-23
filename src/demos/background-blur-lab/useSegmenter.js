import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';
import { MODELS, WASM_URL } from './config.js';

let filesetPromise = null;
const getFileset = () => {
  filesetPromise ??= FilesetResolver.forVisionTasks(WASM_URL).catch((err) => {
    filesetPromise = null; // allow a retry after a network failure
    throw err;
  });
  return filesetPromise;
};

const create = (fileset, model, delegate) =>
  ImageSegmenter.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODELS[model].url, delegate },
    runningMode: 'VIDEO',
    outputConfidenceMasks: true,
    outputCategoryMask: false,
  });

let nextId = 1;

// Builds an ImageSegmenter for the given model and delegate, rebuilding when either changes.
// The live instance lives in a ref ({ segmenter, delegate, id, lastTs }) so the render loop can
// read it without re-rendering; a new `id` tells the loop to reset its per-segmenter state.
export function useSegmenter(model, delegate) {
  const ref = useRef(null);
  const [status, setStatus] = useState({ state: 'loading', delegate: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setStatus({ state: 'loading', delegate: null, error: null });

    (async () => {
      const fileset = await getFileset();
      let segmenter;
      let used = delegate;
      try {
        segmenter = await create(fileset, model, delegate);
      } catch (err) {
        if (delegate !== 'GPU' || cancelled) throw err;
        console.warn('GPU delegate failed, falling back to CPU', err);
        segmenter = await create(fileset, model, 'CPU');
        used = 'CPU';
      }
      // Settings changed (or the component unmounted) while this build was in flight.
      if (cancelled) {
        segmenter.close();
        return;
      }
      ref.current = { segmenter, delegate: used, id: nextId++, lastTs: 0 };
      setStatus({ state: 'ready', delegate: used, fellBack: used !== delegate, error: null });
    })().catch((err) => {
      if (cancelled) return;
      console.error(err);
      setStatus({ state: 'error', delegate: null, error: err?.message || String(err) });
    });

    return () => {
      cancelled = true;
      ref.current?.segmenter.close();
      ref.current = null;
    };
  }, [model, delegate]);

  return { segmenterRef: ref, ...status };
}
