/**
 * Generate health insights and posture analysis based on session data.
 */

export function getPostureGrade(goodPct) {
  if (goodPct >= 90) return { grade: 'A+', label: 'Excellent', color: '#10b981' };
  if (goodPct >= 80) return { grade: 'A', label: 'Great', color: '#22c55e' };
  if (goodPct >= 70) return { grade: 'B', label: 'Good', color: '#84cc16' };
  if (goodPct >= 60) return { grade: 'C', label: 'Fair', color: '#eab308' };
  if (goodPct >= 40) return { grade: 'D', label: 'Poor', color: '#f97316' };
  return { grade: 'F', label: 'Critical', color: '#ef4444' };
}

export function getHealthImpacts(goodPct, slouchEvents, durationMin) {
  const impacts = [];

  if (goodPct >= 80) {
    impacts.push({
      type: 'positive',
      icon: '\u2705',
      title: 'Spinal Health',
      text: 'Your upright posture reduces disc compression and maintains natural spinal curvature.',
    });
    impacts.push({
      type: 'positive',
      icon: '\u2705',
      title: 'Breathing & Energy',
      text: 'Good posture opens the chest cavity, improving lung capacity by up to 30%.',
    });
    impacts.push({
      type: 'positive',
      icon: '\u2705',
      title: 'Reduced Neck Strain',
      text: 'Keeping ears aligned with shoulders reduces neck load from ~50 lbs (forward head) to ~10 lbs.',
    });
  }

  if (goodPct < 60) {
    impacts.push({
      type: 'negative',
      icon: '\u26A0\uFE0F',
      title: 'Forward Head Posture Risk',
      text: 'Prolonged slouching shifts head forward, adding 10 lbs of stress per inch to cervical spine.',
    });
    impacts.push({
      type: 'negative',
      icon: '\u26A0\uFE0F',
      title: 'Thoracic Kyphosis',
      text: 'Sustained rounding of the upper back can lead to chronic pain and reduced mobility.',
    });
  }

  if (goodPct < 40) {
    impacts.push({
      type: 'negative',
      icon: '\u274C',
      title: 'Chronic Pain Risk',
      text: 'Poor posture habits are a leading cause of tension headaches, shoulder impingement, and lower back pain.',
    });
    impacts.push({
      type: 'negative',
      icon: '\u274C',
      title: 'Digestive Impact',
      text: 'Slouching compresses abdominal organs, which can slow digestion and cause discomfort.',
    });
  }

  if (slouchEvents > 10 && durationMin > 5) {
    impacts.push({
      type: 'tip',
      icon: '\uD83D\uDCA1',
      title: 'Frequent Corrections',
      text: `You corrected your posture ${slouchEvents} times. Try the 20-20-20 rule: every 20 min, look 20 ft away for 20 sec and reset your posture.`,
    });
  }

  if (durationMin >= 30 && goodPct >= 70) {
    impacts.push({
      type: 'positive',
      icon: '\uD83C\uDFC6',
      title: 'Consistency Bonus',
      text: `${durationMin} minutes of mostly good posture! Regular practice like this strengthens postural muscles over time.`,
    });
  }

  if (goodPct >= 60 && goodPct < 80) {
    impacts.push({
      type: 'tip',
      icon: '\uD83D\uDCA1',
      title: 'Almost There',
      text: 'You\'re in the moderate zone. Try adjusting your monitor height to eye level and using lumbar support.',
    });
  }

  return impacts;
}

export function getSessionSummaryText(session) {
  const grade = getPostureGrade(session.goodPct);
  const lines = [
    `Posture Coach - Session Summary`,
    `${'='.repeat(35)}`,
    `Date: ${new Date(session.date).toLocaleString()}`,
    `Duration: ${session.durationFormatted}`,
    ``,
    `Grade: ${grade.grade} (${grade.label})`,
    `Good Posture: ${session.goodPct}%`,
    `Slouch Events: ${session.slouchEvents}`,
    `Avg Angle: ${session.avgAngle}\u00B0`,
    ``,
    `Health Insights:`,
  ];

  const impacts = getHealthImpacts(session.goodPct, session.slouchEvents, session.durationSec / 60);
  impacts.forEach((i) => {
    lines.push(`${i.icon} ${i.title}: ${i.text}`);
  });

  return lines.join('\n');
}
