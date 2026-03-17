import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

let detector = null;

export async function initPoseDetector() {
  await tf.setBackend('webgl');
  await tf.ready();

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableSmoothing: true,
    }
  );

  return detector;
}

export async function detectPose(video) {
  if (!detector || !video || video.readyState < 2) return null;

  const poses = await detector.estimatePoses(video, {
    flipHorizontal: false,
  });

  return poses.length > 0 ? poses[0] : null;
}

export function getKeypointByName(keypoints, name) {
  return keypoints?.find((kp) => kp.name === name) ?? null;
}

export function getDetector() {
  return detector;
}
