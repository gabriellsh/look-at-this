import { useEffect, useRef, useState } from 'react';

// Shows the composited canvas as a real MediaStream (canvas.captureStream), the same kind of
// track that could replace the camera track in a WebRTC call.
export default function OutputStream({ canvasRef }) {
  const videoRef = useRef(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas?.captureStream || !video) {
      setInfo('This browser does not support canvas.captureStream().');
      return undefined;
    }
    const stream = canvas.captureStream(30);
    video.srcObject = stream;
    video.play().catch(() => {});
    const track = stream.getVideoTracks()[0];
    setInfo(`MediaStreamTrack · kind=${track.kind} · id=${track.id.slice(0, 8)}…`);
    return () => {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    };
  }, [canvasRef]);

  return (
    <figure className="output-stream">
      <video ref={videoRef} muted playsInline />
      <figcaption className="hint">{info}</figcaption>
    </figure>
  );
}
