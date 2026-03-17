import { useEffect, useRef } from 'react';
import { detectPose } from '../services/poseDetection';
import { analyzePosture } from '../utils/postureAnalysis';
import { drawPose } from '../utils/drawing';

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

export default function Webcam({ isRunning, calibrationAngle, onPostureUpdate, onUserAway }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  // Store latest props in refs to avoid re-creating the detection loop
  const isRunningRef = useRef(isRunning);
  const calibrationRef = useRef(calibrationAngle);
  const callbackRef = useRef(onPostureUpdate);
  const onUserAwayRef = useRef(onUserAway);
  const nullPoseStart = useRef(null);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { calibrationRef.current = calibrationAngle; }, [calibrationAngle]);
  useEffect(() => { callbackRef.current = onPostureUpdate; }, [onPostureUpdate]);
  useEffect(() => { onUserAwayRef.current = onUserAway; }, [onUserAway]);

  // Start webcam
  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access denied:', err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Detection loop - runs once, reads latest values from refs
  useEffect(() => {
    let running = true;

    async function detect() {
      if (!running) return;

      if (!isRunningRef.current || !videoRef.current || !canvasRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth || VIDEO_WIDTH;
      canvas.height = video.videoHeight || VIDEO_HEIGHT;

      const pose = await detectPose(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pose) {
        nullPoseStart.current = null;
        const result = analyzePosture(pose, calibrationRef.current);
        drawPose(ctx, pose, result?.isSlouching ?? false);
        callbackRef.current(result);
      } else if (isRunningRef.current) {
        if (!nullPoseStart.current) {
          nullPoseStart.current = Date.now();
        } else if (Date.now() - nullPoseStart.current > 3000) {
          nullPoseStart.current = null;
          onUserAwayRef.current?.();
        }
      }

      if (running) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    }

    animFrameRef.current = requestAnimationFrame(detect);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="webcam-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <canvas ref={canvasRef} />
    </div>
  );
}
