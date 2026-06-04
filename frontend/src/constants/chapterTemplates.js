/**
 * Pre-defined "life chapter" templates shown on the dashboard.
 * Users can start journaling from a template without typing a title first.
 *
 * Each template can define `fields`: extra, personalized prompts shown on the
 * journal form for that chapter type (for example a Dating chapter asks for the
 * date number and restaurant). Field values are saved in the entry's `details`.
 */

export const CHAPTER_TEMPLATES = [
  {
    id: 'college',
    title: 'College',
    emoji: '🎓',
    blurb: 'Classes, roommates, campus milestones.',
    fields: [
      { name: 'course', label: 'Class / course', placeholder: 'Intro to Psychology' },
      { name: 'location', label: 'Where', placeholder: 'Library, dorm, quad…' },
    ],
  },
  {
    id: 'dating',
    title: 'Shidduch / Dating',
    emoji: '💕',
    blurb: 'Dates, reflections, and what you are looking for.',
    fields: [
      { name: 'dateNumber', label: 'Date number', type: 'number', placeholder: '1' },
      { name: 'name', label: 'Name', placeholder: "Your date's name" },
      { name: 'activity', label: 'Activity', placeholder: 'Mini golf, museum…' },
      { name: 'restaurant', label: 'Restaurant', placeholder: 'Where did you go?' },
    ],
  },
  {
    id: 'gap-year',
    title: 'Gap Year',
    emoji: '✈️',
    blurb: 'Travel, service, and new experiences.',
    fields: [
      { name: 'location', label: 'Location', placeholder: 'City / country' },
      { name: 'activity', label: 'Activity', placeholder: 'Hiking, volunteering…' },
    ],
  },
  {
    id: 'new-job',
    title: 'New Job',
    emoji: '💼',
    blurb: 'First weeks, wins, and lessons learned.',
    fields: [
      { name: 'company', label: 'Company', placeholder: 'Where do you work?' },
      { name: 'role', label: 'Role', placeholder: 'Your title' },
      { name: 'win', label: 'Win of the day', placeholder: 'Something that went well' },
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement',
    emoji: '💍',
    blurb: 'Planning, family, and simcha moments.',
    fields: [
      { name: 'event', label: 'Event', placeholder: 'Vort, ring shopping…' },
      { name: 'location', label: 'Where', placeholder: 'Location' },
    ],
  },
  {
    id: 'custom',
    title: 'Custom Chapter',
    emoji: '✨',
    blurb: 'Name your own season of life.',
    fields: [],
  },
];

/**
 * Finds a template by its id (returns null when not found).
 */
export function getTemplateById(id) {
  return CHAPTER_TEMPLATES.find((template) => template.id === id) ?? null;
}

/**
 * Returns the personalized prompt fields for a chapter's template (or []).
 */
export function getChapterFields(templateId) {
  return getTemplateById(templateId)?.fields ?? [];
}
