import { useState } from 'react';
import { detectPose } from '../services/poseDetection';
import { analyzePosture } from '../utils/postureAnalysis';

export default function CalibrationPanel({ videoRef, onCalibrate, calibrationAngle }) {
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  async function handleCalibrate() {
    if (!videoRef?.current) return;
    setStatus('capturing');
    setProgress(0);

    const angles = [];
    for (let i = 0; i < 5; i++) {
      const pose = await detectPose(videoRef.current);
      if (pose) {
        const result = analyzePosture(pose);
        if (result) angles.push(result.angle);
      }
      setProgress((i + 1) * 20);
      await new Promise((r) => setTimeout(r, 200));
    }

    if (angles.length === 0) {
      setStatus('failed');
      return;
    }

    const avg = Math.round(angles.reduce((a, b) => a + b, 0) / angles.length);
    onCalibrate(avg);
    setStatus('done');
  }

  return (
    <div className="calibration-panel">
      <div className="cal-header">
        <span className="cal-icon">{calibrationAngle ? '\u2705' : '\uD83C\uDFAF'}</span>
        <div>
          <h3>Calibration</h3>
          <p>Sit up straight, then calibrate your baseline.</p>
        </div>
      </div>

      {status === 'capturing' && (
        <div className="cal-progress">
          <div className="cal-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button
        className={calibrationAngle ? 'btn-ghost' : 'btn-accent'}
        onClick={handleCalibrate}
        disabled={status === 'capturing'}
      >
        {status === 'capturing' ? 'Scanning...' : calibrationAngle ? 'Recalibrate' : 'Calibrate Now'}
      </button>

      {calibrationAngle && (
        <div className="cal-result">
          Baseline: <strong>{calibrationAngle}°</strong>
        </div>
      )}
      {status === 'failed' && (
        <p className="error-text">Could not detect pose. Try again.</p>
      )}
    </div>
  );
}
