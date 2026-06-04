/**
 * Preset moods shown as selectable emoji faces (and in the mood dropdown).
 * A mood is stored on an entry as the combined "emoji label" string, e.g.
 * "😊 Happy", so it displays nicely everywhere without extra lookups.
 */

export const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'Grateful' },
  { emoji: '😍', label: 'Excited' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '😟', label: 'Nervous' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '🥳', label: 'Celebrating' },
  { emoji: '😴', label: 'Tired' },
];

/**
 * Builds the value stored for a mood ("😊 Happy").
 */
export function moodValue(mood) {
  return `${mood.emoji} ${mood.label}`;
}
