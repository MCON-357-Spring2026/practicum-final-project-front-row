/**
 * Journal Entry Form — daily stories, photo uploads, and chapter goals.
 * Submissions are saved to the backend through the parent's handlers.
 *
 * Each entry can capture a date plus a set of personalized prompts that depend
 * on the chapter's template (see chapterTemplates.js), all stored on the entry.
 */

import { useState } from 'react';
import { getChapterFields } from '../constants/chapterTemplates.js';
import { MOODS, moodValue } from '../constants/moods.js';

// Today's date as YYYY-MM-DD for the default value of date inputs.
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Builds an empty value map for the given prompt fields ({ course: '', ... }).
function emptyDetails(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, '']));
}

export function JournalEntryForm({
  chapter,
  onBack,
  onAddStory,
  onAddGoal,
  onToggleGoal,
  onAddPhotos,
}) {
  // Personalized prompts for this chapter type (may be empty).
  const templateFields = getChapterFields(chapter.templateId);

  const [storyTitle, setStoryTitle] = useState('');
  const [storyBody, setStoryBody] = useState('');
  const [entryDate, setEntryDate] = useState(todayISO());
  const [mood, setMood] = useState('');
  const [detailValues, setDetailValues] = useState(() => emptyDetails(templateFields));
  const [photoCaption, setPhotoCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  function showSaved(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  }

  // Updates one personalized prompt value as the user types.
  function handleDetailChange(name, value) {
    setDetailValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveStory(event) {
    event.preventDefault();
    if (!storyTitle.trim() || !storyBody.trim()) {
      setMessage('Add both a title and story text.');
      return;
    }

    // Keep only the prompts the user actually filled in.
    const details = Object.fromEntries(
      Object.entries(detailValues).filter(([, value]) => value.trim() !== ''),
    );

    try {
      await onAddStory({
        title: storyTitle,
        body: storyBody,
        entryDate,
        mood: mood.trim(),
        details,
      });
      setStoryTitle('');
      setStoryBody('');
      setEntryDate(todayISO());
      setMood('');
      setDetailValues(emptyDetails(templateFields));
      showSaved('Story saved.');
    } catch (err) {
      setMessage(err.message || 'Could not save story.');
    }
  }

  function handleFileChange(event) {
    setSelectedFiles(Array.from(event.target.files ?? []));
  }

  async function handleAddPhotos(event) {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setMessage('Choose at least one image.');
      return;
    }

    setUploading(true);
    setMessage('Uploading…');
    try {
      const count = await onAddPhotos({
        files: selectedFiles,
        caption: photoCaption.trim(),
      });
      setSelectedFiles([]);
      setPhotoCaption('');
      showSaved(`${count} photo(s) uploaded.`);
    } catch (err) {
      setMessage(err.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleAddGoal(event) {
    event.preventDefault();
    if (!goalTitle.trim()) {
      setMessage('Goal title is required.');
      return;
    }

    try {
      await onAddGoal({ title: goalTitle, notes: goalNotes });
      setGoalTitle('');
      setGoalNotes('');
      showSaved('Goal added.');
    } catch (err) {
      setMessage(err.message || 'Could not add goal.');
    }
  }

  return (
    <div className="page">
      <header className="page-header page-header--compact">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Dashboard
        </button>
        <div>
          <h1>
            {chapter.emoji} Journal · {chapter.title}
          </h1>
          <p className="muted">Log today&apos;s story, photos, and goals.</p>
        </div>
      </header>

      {message && (
        <p className="toast" role="status">
          {message}
        </p>
      )}

      <form className="panel stack-form" onSubmit={handleSaveStory}>
        <h2>Today&apos;s story</h2>
        <label className="field">
          <span>Date</span>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Coffee with a friend"
          />
        </label>

        {/* Personalized prompts for this chapter type (e.g. date number, restaurant). */}
        {templateFields.map((field) => (
          <label className="field" key={field.name}>
            <span>{field.label}</span>
            <input
              type={field.type ?? 'text'}
              value={detailValues[field.name] ?? ''}
              onChange={(e) => handleDetailChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          </label>
        ))}

        <label className="field">
          <span>Story</span>
          <textarea
            rows={5}
            value={storyBody}
            onChange={(e) => setStoryBody(e.target.value)}
            placeholder="What happened today? How did it feel?"
          />
        </label>
        <div className="field">
          <span>Mood (optional)</span>
          {/* Pick a mood by tapping a face… */}
          <div className="mood-picker" role="group" aria-label="Choose a mood">
            {MOODS.map((option) => {
              const value = moodValue(option);
              const isActive = mood === value;
              return (
                <button
                  type="button"
                  key={option.label}
                  className={isActive ? 'mood-chip mood-chip--active' : 'mood-chip'}
                  aria-pressed={isActive}
                  title={option.label}
                  // Tap again to clear the mood.
                  onClick={() => setMood(isActive ? '' : value)}
                >
                  <span className="mood-chip__face" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span className="mood-chip__label">{option.label}</span>
                </button>
              );
            })}
          </div>
          {/* …or choose the same mood from a dropdown. */}
          <select
            className="mood-select"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            aria-label="Mood dropdown"
          >
            <option value="">No mood</option>
            {MOODS.map((option) => (
              <option key={option.label} value={moodValue(option)}>
                {moodValue(option)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn--primary">
          Save story
        </button>
      </form>

      <form className="panel stack-form" onSubmit={handleAddPhotos}>
        <h2>Photos</h2>
        <label className="field">
          <span>Upload images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </label>
        {selectedFiles.length > 0 && (
          <p className="muted">{selectedFiles.length} file(s) selected</p>
        )}
        <label className="field">
          <span>Caption (optional)</span>
          <input
            type="text"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="Sukkos lunch on the quad"
          />
        </label>
        <button type="submit" className="btn btn--secondary" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Add photos'}
        </button>
      </form>

      <section className="panel">
        <h2>Goals for this chapter</h2>
        <form className="stack-form" onSubmit={handleAddGoal}>
          <label className="field">
            <span>Goal</span>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Join a campus club"
            />
          </label>
          <label className="field">
            <span>Notes (optional)</span>
            <textarea
              rows={2}
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              placeholder="Why this matters to you"
            />
          </label>
          <button type="submit" className="btn btn--secondary">
            Add goal
          </button>
        </form>

        {chapter.goals.length > 0 && (
          <ul className="goal-list">
            {chapter.goals.map((goal) => (
              <li key={goal.id}>
                <label className="goal-check">
                  <input
                    type="checkbox"
                    checked={goal.isCompleted}
                    onChange={() => onToggleGoal(goal.id)}
                  />
                  <span className={goal.isCompleted ? 'goal-done' : ''}>
                    {goal.title}
                  </span>
                </label>
                {goal.notes && <p className="muted">{goal.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
