import { useEffect } from 'react';
import Preview from './Preview.jsx';

export default function PreviewModal({ demos, index, onChange, onClose }) {
  const demo = demos[index];
  const go = (step) => onChange((index + step + demos.length) % demos.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={demo.title} onClick={(e) => e.stopPropagation()}>
        <div className="browser-bar">
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span className="address mono">{demo.url ?? 'no url yet'}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close preview">✕</button>
        </div>

        <div className="modal-stage" key={demo.id}>
          <Preview demo={demo} live />
        </div>

        <div className="modal-info">
          <div>
            <h2 className="modal-title">{demo.title}</h2>
            <p className="card-desc">{demo.description}</p>
          </div>
          <div className="modal-actions">
            {demos.length > 1 && (
              <>
                <button className="btn ghost" onClick={() => go(-1)} aria-label="Previous demo">←</button>
                <button className="btn ghost" onClick={() => go(1)} aria-label="Next demo">→</button>
              </>
            )}
            {demo.repo && (
              <a className="btn ghost" href={demo.repo} target="_blank" rel="noreferrer">Source</a>
            )}
            {demo.url && (
              <a className="btn primary" href={demo.url} target="_blank" rel="noreferrer">Open demo ↗</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
