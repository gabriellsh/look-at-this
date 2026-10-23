import { useEffect, useRef, useState } from 'react';

// Two googly eyes that follow the pointer and blink now and then.
export default function Eyes() {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(1, Math.hypot(dx, dy) / 300);
      setOffset({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        schedule();
      }, 2500 + Math.random() * 3500);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const pupil = { transform: `translate(${offset.x * 10}px, ${offset.y * 12}px)` };

  return (
    <div className={`eyes ${blink ? 'is-blinking' : ''}`} ref={ref} aria-hidden="true">
      <div className="eye"><div className="pupil" style={pupil} /></div>
      <div className="eye"><div className="pupil" style={pupil} /></div>
    </div>
  );
}
