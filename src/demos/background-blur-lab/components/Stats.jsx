function delegateLabel(segmenter) {
  if (!segmenter.delegate) return '–';
  const name = segmenter.delegate === 'GPU' ? 'GPU (WebGL)' : 'CPU (WASM)';
  return segmenter.fellBack ? `${name}, GPU failed` : name;
}

export default function Stats({ stats, segmenter }) {
  const items = [
    ['Inference', stats ? (stats.inference == null ? 'off' : `${stats.inference.toFixed(1)} ms`) : '–'],
    ['Frame rate', stats ? `${stats.fps.toFixed(0)} fps` : '–'],
    ['Mask size', stats?.maskSize ?? '–'],
    ['Delegate', delegateLabel(segmenter)],
  ];
  return (
    <div className="stats" aria-live="off">
      {items.map(([label, value]) => (
        <div className="stat" key={label}>
          <span>{label}</span>
          <b title={value}>{value}</b>
        </div>
      ))}
    </div>
  );
}
