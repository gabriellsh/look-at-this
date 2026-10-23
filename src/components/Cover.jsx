import { useMemo } from 'react';

// Deterministic generative cover so demos without a screenshot still look distinct.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export default function Cover({ seed, title }) {
  const shapes = useMemo(() => {
    const rand = hash(seed);
    const hue = Math.floor(rand() * 360);
    const blobs = Array.from({ length: 5 }, (_, i) => ({
      cx: rand() * 400,
      cy: rand() * 250,
      r: 40 + rand() * 110,
      fill: `hsl(${(hue + i * 37) % 360} 85% ${55 + rand() * 15}%)`,
      dur: 6 + rand() * 8,
      dx: (rand() - 0.5) * 80,
      dy: (rand() - 0.5) * 60,
    }));
    return { hue, blobs };
  }, [seed]);

  return (
    <svg className="cover" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label={title}>
      <defs>
        <filter id={`blur-${seed}`}><feGaussianBlur stdDeviation="28" /></filter>
        <pattern id={`dots-${seed}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(255,255,255,0.18)" />
        </pattern>
      </defs>
      <rect width="400" height="250" fill={`hsl(${shapes.hue} 40% 12%)`} />
      <g filter={`url(#blur-${seed})`}>
        {shapes.blobs.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} opacity="0.85">
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 0; ${b.dx} ${b.dy}; 0 0`}
              dur={`${b.dur}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
      <rect width="400" height="250" fill={`url(#dots-${seed})`} />
    </svg>
  );
}
