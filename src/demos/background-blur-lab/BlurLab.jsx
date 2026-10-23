import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULTS, MEDIAPIPE_VERSION, MODEL_CARD_URL } from './config.js';
import { getBackgrounds } from './backgrounds.js';
import { useSegmenter } from './useSegmenter.js';
import { useVideoSource } from './useVideoSource.js';
import { useRenderLoop } from './useRenderLoop.js';
import Stage from './components/Stage.jsx';
import Controls from './components/Controls.jsx';
import Stats from './components/Stats.jsx';
import OutputStream from './components/OutputStream.jsx';

export default function BlurLab() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [customBg, setCustomBg] = useState(null); // { img, url }
  const [stats, setStats] = useState(null);
  const [showStream, setShowStream] = useState(false);
  const canvasRef = useRef(null);

  const segmenter = useSegmenter(settings.model, settings.delegate);
  const video = useVideoSource();
  const { source } = video;

  const backgrounds = getBackgrounds();
  const background = settings.bg === 'custom' && customBg ? customBg.img : backgrounds[settings.bg].canvas;

  // The render loop reads this every frame, so slider changes apply without restarting it.
  const settingsRef = useRef(null);
  settingsRef.current = { ...settings, background };

  useRenderLoop({ canvasRef, source, segmenterRef: segmenter.segmenterRef, settingsRef, onStats: setStats });

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const onCustomBg = useCallback(
    async (file) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      try {
        await img.decode();
      } catch {
        URL.revokeObjectURL(url);
        video.setError("That background image couldn't be read. Try a JPEG or PNG.");
        return;
      }
      setCustomBg({ img, url });
      update({ bg: 'custom' });
    },
    [update, video.setError],
  );

  useEffect(() => () => customBg && URL.revokeObjectURL(customBg.url), [customBg]);

  return (
    <div className="bbl">
      <div className="wrap">
        <a className="back" href="../../" target="_top">← look-at-this</a>
        <header>
          <h1>Background Blur Lab</h1>
          <p>
            MediaPipe's pretrained selfie segmenter, used as-is, with blur and background replacement
            composited in the browser. Frames are processed locally and never uploaded.
          </p>
        </header>

        <div className="layout">
          <div className="stage-col">
            <Stage canvasRef={canvasRef} segmenter={segmenter} video={video} />
            <Stats stats={stats} segmenter={segmenter} />
            {source && (
              <div className="source-bar">
                <label className="check">
                  <input type="checkbox" checked={showStream} onChange={(e) => setShowStream(e.target.checked)} />
                  Show output as a MediaStream
                </label>
              </div>
            )}
            {source && showStream && <OutputStream canvasRef={canvasRef} />}
          </div>

          <Controls
            settings={settings}
            update={update}
            backgrounds={backgrounds}
            customBg={customBg}
            onCustomBg={onCustomBg}
            isCamera={source?.kind === 'camera'}
          />
        </div>

        <footer className="notes">
          <p>
            <b>What the controls map to.</b> Edge softness sets the width of the confidence band treated
            as partial transparency. Feather blurs the upscaled mask. Temporal smoothing blends each mask
            with the previous one to reduce flicker. The model and delegate switches rebuild the segmenter.
          </p>
          <p>
            <b>Privacy.</b> Everything runs on this device. The only network requests are the MediaPipe
            runtime and the two model files; no frames, masks or stats are sent anywhere.
          </p>
          <p>
            Runtime: <code>@mediapipe/tasks-vision@{MEDIAPIPE_VERSION}</code> (
            <a href="https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE" target="_blank" rel="noreferrer">Apache-2.0</a>
            ) with the float16 <code>selfie_segmenter</code> models (
            <a href={MODEL_CARD_URL} target="_blank" rel="noreferrer">model card and terms</a>
            ).
          </p>
        </footer>
      </div>
    </div>
  );
}
