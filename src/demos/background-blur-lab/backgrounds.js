// Sample backgrounds drawn procedurally, so the demo ships without image files.
const W = 1280;
const H = 720;

function canvas(draw) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  draw(c.getContext('2d'));
  return c;
}

function office(o) {
  const g = o.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#dfe6e3');
  g.addColorStop(0.62, '#c9d2cc');
  g.addColorStop(0.62, '#a58f74');
  g.addColorStop(1, '#8a755d');
  o.fillStyle = g;
  o.fillRect(0, 0, W, H);
  o.fillStyle = '#f5f7f2';
  o.fillRect(80, 80, 360, 300);
  o.fillStyle = '#bcd3db';
  o.fillRect(96, 96, 160, 268);
  o.fillRect(268, 96, 156, 268);
  o.fillStyle = '#3f5d4a';
  for (let i = 0; i < 7; i++) {
    o.beginPath();
    o.ellipse(1050 + Math.cos(i) * 60, 330 - i * 28, 70, 26, i * 0.7, 0, Math.PI * 2);
    o.fill();
  }
  o.fillStyle = '#6d5a47';
  o.fillRect(1000, 380, 100, 70);
  o.fillStyle = '#e8dcc6';
  o.fillRect(620, 150, 240, 150);
  o.fillStyle = '#c7553a';
  o.fillRect(650, 180, 80, 90);
  o.fillStyle = '#2f6f8f';
  o.fillRect(750, 200, 80, 70);
}

function dusk(d) {
  const g = d.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1d2b53');
  g.addColorStop(0.55, '#7e4a74');
  g.addColorStop(1, '#f19a6b');
  d.fillStyle = g;
  d.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = (i * 197) % W;
    const y = 380 + ((i * 89) % 300);
    const r = 18 + ((i * 37) % 46);
    const rg = d.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(255,214,170,0.55)');
    rg.addColorStop(1, 'rgba(255,214,170,0)');
    d.fillStyle = rg;
    d.beginPath();
    d.arc(x, y, r, 0, Math.PI * 2);
    d.fill();
  }
}

function studio(s) {
  const g = s.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.45, W * 0.7);
  g.addColorStop(0, '#8c969c');
  g.addColorStop(1, '#3a4146');
  s.fillStyle = g;
  s.fillRect(0, 0, W, H);
}

export const PRESETS = [
  { key: 'office', label: 'Office', draw: office },
  { key: 'dusk', label: 'Dusk', draw: dusk },
  { key: 'studio', label: 'Studio grey', draw: studio },
];

let cache = null;

// { [key]: { canvas, thumb } }, built once on first use.
export function getBackgrounds() {
  cache ??= Object.fromEntries(
    PRESETS.map(({ key, draw }) => {
      const c = canvas(draw);
      return [key, { canvas: c, thumb: c.toDataURL('image/jpeg', 0.6) }];
    }),
  );
  return cache;
}
