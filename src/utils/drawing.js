import { SKELETON_CONNECTIONS } from './postureAnalysis';

const MIN_CONFIDENCE = 0.3;

export function drawPose(ctx, pose, isSlouching) {
  if (!pose?.keypoints) return;

  const kp = pose.keypoints;
  const color = isSlouching ? '#ef4444' : '#22c55e';

  // Draw skeleton connections
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (const [nameA, nameB] of SKELETON_CONNECTIONS) {
    const a = kp.find((k) => k.name === nameA);
    const b = kp.find((k) => k.name === nameB);
    if (a && b && a.score > MIN_CONFIDENCE && b.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // Draw keypoints
  for (const point of kp) {
    if (point.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
