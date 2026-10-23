import { useRef } from 'react';
import Preview from './Preview.jsx';

export default function DemoCard({ demo, index, onPreview }) {
  const ref = useRef(null);

  // Subtle 3D tilt toward the pointer.
  const onMove = (e) => {
    const el = ref.current;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    el.style.setProperty('--rx', `${-y * 6}deg`);
    el.style.setProperty('--ry', `${x * 8}deg`);
    el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    ref.current.style.setProperty('--rx', '0deg');
    ref.current.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      ref={ref}
      className="card"
      style={{ animationDelay: `${index * 70}ms` }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <button className="card-preview" onClick={onPreview} aria-label={`Preview ${demo.title}`}>
        <Preview demo={demo} />
        <span className="card-peek">peek ↗</span>
      </button>
      <div className="card-body">
        <div className="card-meta">
          <span className="mono">{String(index + 1).padStart(2, '0')}</span>
          {demo.year && <span className="mono">{demo.year}</span>}
        </div>
        <h2 className="card-title">{demo.title}</h2>
        <p className="card-desc">{demo.description}</p>
        <div className="card-tags">
          {demo.tags?.map((t) => <span key={t} className="tag">#{t}</span>)}
        </div>
      </div>
    </article>
  );
}
