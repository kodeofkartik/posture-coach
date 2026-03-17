const MIN_CONFIDENCE = 0.3;

/**
 * Calculate angle (in degrees) at point B given three points A, B, C.
 */
export function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Extract a keypoint by name with confidence check.
 */
function getPoint(keypoints, name) {
  const kp = keypoints.find((k) => k.name === name);
  if (!kp || kp.score < MIN_CONFIDENCE) return null;
  return kp;
}

/**
 * Analyze posture from a single pose. Uses the ear-shoulder-hip angle
 * on both sides and returns the average. A smaller angle indicates
 * the ear is forward of the shoulder line (slouching).
 */
export function analyzePosture(pose, calibrationAngle = null) {
  if (!pose?.keypoints) return null;

  const kp = pose.keypoints;

  // Try left side
  const leftEar = getPoint(kp, 'left_ear');
  const leftShoulder = getPoint(kp, 'left_shoulder');
  const leftHip = getPoint(kp, 'left_hip');

  // Try right side
  const rightEar = getPoint(kp, 'right_ear');
  const rightShoulder = getPoint(kp, 'right_shoulder');
  const rightHip = getPoint(kp, 'right_hip');

  const angles = [];

  if (leftEar && leftShoulder && leftHip) {
    angles.push(calculateAngle(leftEar, leftShoulder, leftHip));
  }

  if (rightEar && rightShoulder && rightHip) {
    angles.push(calculateAngle(rightEar, rightShoulder, rightHip));
  }

  if (angles.length === 0) return null;

  const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;

  // If calibrated, use calibration-relative threshold
  const threshold = calibrationAngle ? calibrationAngle - 15 : 155;

  const isSlouching = avgAngle < threshold;

  return {
    angle: Math.round(avgAngle),
    isSlouching,
    confidence:
      angles.length === 2 ? 'high' : 'low',
    sides: angles.length,
  };
}

/**
 * SKELETON_CONNECTIONS defines pairs of keypoint names to draw lines between.
 */
export const SKELETON_CONNECTIONS = [
  ['left_ear', 'left_shoulder'],
  ['right_ear', 'right_shoulder'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];
