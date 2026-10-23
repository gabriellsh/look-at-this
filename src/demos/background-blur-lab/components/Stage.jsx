import { useEffect, useRef, useState } from 'react';

function badgeFor(segmenter, source) {
  if (segmenter.state === 'error') return ['error', 'Model failed'];
  if (segmenter.state === 'loading') return ['loading', 'Loading model'];
  return source ? ['live', 'Live'] : ['idle', 'Ready'];
}

function FileButton({ label, onFile, className = 'btn ghost' }) {
  return (
    <label className={className}>
      {label}
      <input
        className="sr"
        type="file"
        accept="video/*,image/*"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = ''; // allow re-opening the same file
        }}
      />
    </label>
  );
}

function CameraPicker({ devices, current, onPick }) {
  // Labels are empty until camera permission has been granted once.
  if (devices.length < 2 || !devices.some((d) => d.label)) return null;
  return (
    <select className="select" value={current ?? ''} onChange={(e) => onPick(e.target.value)} aria-label="Camera">
      {devices.map((d, i) => (
        <option key={d.deviceId} value={d.deviceId}>
          {d.label || `Camera ${i + 1}`}
        </option>
      ))}
    </select>
  );
}

export default function Stage({ canvasRef, segmenter, video }) {
  const { source, error, devices, startCamera, openFile, stop } = video;
  const [dragging, setDragging] = useState(false);
  const holderRef = useRef(null);
  const [badgeState, badgeText] = badgeFor(segmenter, source);

  // Keep the source element in the document (invisibly). Some browsers, Safari in particular,
  // stop decoding frames for detached or offscreen-hidden videos.
  useEffect(() => {
    const holder = holderRef.current;
    if (!source || !holder) return undefined;
    holder.appendChild(source.el);
    return () => source.el.remove();
  }, [source]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    openFile(e.dataTransfer.files?.[0]);
  };

  const message = error || (segmenter.state === 'error'
    ? `The segmenter could not start: ${segmenter.error}. Try the CPU delegate or another browser.`
    : null);

  return (
    <>
      <div
        className={`stage ${dragging ? 'drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <canvas ref={canvasRef} width="1280" height="720" aria-label="Processed video output" />
        <div className="source-holder" ref={holderRef} aria-hidden="true" />
        <div className="badge" data-state={badgeState}>
          <span className="dot" />
          <span>{badgeText}</span>
        </div>

        {!source && (
          <div className="empty">
            <h2>Pick a source to segment</h2>
            <p>Use your camera, or open a video or photo of a person. You can also drop a file here.</p>
            <div className="row">
              <button className="btn" type="button" onClick={() => startCamera()}>Start camera</button>
              <FileButton label="Open video or photo" onFile={openFile} />
            </div>
            {message && <div className="msg" role="alert">{message}</div>}
          </div>
        )}
      </div>

      {source && (
        <div className="source-bar">
          {source.kind === 'camera' ? (
            <CameraPicker devices={devices} current={source.deviceId} onPick={(id) => startCamera(id)} />
          ) : (
            <button className="btn ghost" type="button" onClick={() => startCamera()}>Use camera</button>
          )}
          <FileButton label="Open another file" onFile={openFile} />
          <button className="btn ghost" type="button" onClick={stop}>Stop</button>
          <span className="hint">{source.name}</span>
          {message && <span className="msg inline" role="alert">{message}</span>}
        </div>
      )}
    </>
  );
}
