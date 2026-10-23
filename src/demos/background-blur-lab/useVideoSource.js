import { useCallback, useEffect, useRef, useState } from 'react';

const stopStream = (stream) => stream?.getTracks().forEach((t) => t.stop());

function cameraErrorMessage(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access was blocked. Allow the camera for this site (the icon in the address bar, or site settings), then try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found. Connect one and try again, or open a video or photo instead.';
    case 'NotReadableError':
    case 'AbortError':
      return 'The camera is busy, probably in use by another app such as a video call. Close it and try again.';
    default:
      return `The camera could not start: ${err?.message || err}.`;
  }
}

// Owns the current source element (camera <video>, file <video>, or <img>), its MediaStream and
// object URL. Every start bumps a request token, so a slow getUserMedia or decode that loses a
// race (or finishes after unmount) releases what it acquired instead of leaking it.
export function useVideoSource() {
  const [source, setSource] = useState(null); // { el, kind: 'camera' | 'video' | 'image', name, deviceId? }
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const releaseRef = useRef(null);
  const tokenRef = useRef(0);

  const release = useCallback(() => {
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const all = await navigator.mediaDevices.enumerateDevices();
    setDevices(all.filter((d) => d.kind === 'videoinput'));
  }, []);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshDevices);
      tokenRef.current++;
      release();
    };
  }, [refreshDevices, release]);

  const stop = useCallback(() => {
    tokenRef.current++;
    release();
    setSource(null);
  }, [release]);

  const startCamera = useCallback(
    async (deviceId) => {
      const token = ++tokenRef.current;
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser does not expose a camera here. Camera access needs HTTPS (or localhost).');
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
          audio: false,
        });
      } catch (err) {
        if (token === tokenRef.current) setError(cameraErrorMessage(err));
        return;
      }

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      try {
        await video.play();
      } catch (err) {
        stopStream(stream);
        if (token === tokenRef.current) setError(cameraErrorMessage(err));
        return;
      }
      if (token !== tokenRef.current) {
        stopStream(stream);
        return;
      }

      release();
      const cleanup = () => {
        stopStream(stream);
        video.pause();
        video.srcObject = null;
      };
      releaseRef.current = cleanup;

      const track = stream.getVideoTracks()[0];
      track?.addEventListener('ended', () => {
        if (releaseRef.current !== cleanup) return;
        stop();
        setError('The camera was disconnected.');
      });
      setSource({ el: video, kind: 'camera', name: track?.label || 'Camera', deviceId: track?.getSettings().deviceId });
      refreshDevices(); // labels only become available after permission is granted
    },
    [release, refreshDevices, stop],
  );

  const openFile = useCallback(
    async (file) => {
      if (!file) return;
      const token = ++tokenRef.current;
      setError(null);
      const isVideo = file.type.startsWith('video/');
      if (!isVideo && !file.type.startsWith('image/')) {
        setError("That file isn't a video or image. Choose an MP4, WebM, MOV, JPEG or PNG.");
        return;
      }

      const url = URL.createObjectURL(file);
      let el;
      try {
        if (isVideo) {
          el = document.createElement('video');
          el.muted = true;
          el.loop = true;
          el.playsInline = true;
          el.src = url;
          await el.play();
        } else {
          el = new Image();
          el.src = url;
          await el.decode();
        }
      } catch (err) {
        console.warn(err);
        URL.revokeObjectURL(url);
        if (token === tokenRef.current) {
          setError("This browser couldn't decode that file. Try an MP4 (H.264) or WebM video, or a JPEG or PNG photo.");
        }
        return;
      }
      if (token !== tokenRef.current) {
        if (isVideo) el.pause();
        URL.revokeObjectURL(url);
        return;
      }

      release();
      releaseRef.current = () => {
        if (isVideo) {
          el.pause();
          el.removeAttribute('src');
          el.load();
        }
        URL.revokeObjectURL(url);
      };
      setSource({ el, kind: isVideo ? 'video' : 'image', name: file.name });
    },
    [release],
  );

  return { source, error, setError, devices, startCamera, openFile, stop };
}
