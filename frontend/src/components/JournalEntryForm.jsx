/**
 * Journal Entry Form — daily stories, photo uploads, and chapter goals.
 * Submissions update the active chapter in parent state (then localStorage).
 */

import { useState } from 'react';

export function JournalEntryForm({
  chapter,
  onBack,
  onAddStory,
  onAddGoal,
  onToggleGoal,
  onAddPhotos,
}) {
  const [storyTitle, setStoryTitle] = useState('');
  const [storyBody, setStoryBody] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [message, setMessage] = useState('');

  function showSaved(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  }

  function handleSaveStory(event) {
    event.preventDefault();
    if (!storyTitle.trim() || !storyBody.trim()) {
      setMessage('Add both a title and story text.');
      return;
    }

    onAddStory({ title: storyTitle, body: storyBody });
    setStoryTitle('');
    setStoryBody('');
    showSaved('Story saved.');
  }

  function handleFileChange(event) {
    setSelectedFiles(Array.from(event.target.files ?? []));
  }

  function handleAddPhotos(event) {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setMessage('Choose at least one image.');
      return;
    }

    // Store object URLs for preview in the scrapbook (demo-friendly).
    const entries = selectedFiles.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      caption: photoCaption.trim(),
      createdAt: new Date().toISOString(),
    }));

    onAddPhotos(entries);
    setSelectedFiles([]);
    setPhotoCaption('');
    showSaved(`${entries.length} photo(s) added.`);
  }

  function handleAddGoal(event) {
    event.preventDefault();
    if (!goalTitle.trim()) {
      setMessage('Goal title is required.');
      return;
    }

    onAddGoal({ title: goalTitle, notes: goalNotes });
    setGoalTitle('');
    setGoalNotes('');
    showSaved('Goal added.');
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
          <span>Title</span>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Coffee with a friend"
          />
        </label>
        <label className="field">
          <span>Story</span>
          <textarea
            rows={5}
            value={storyBody}
            onChange={(e) => setStoryBody(e.target.value)}
            placeholder="What happened today? How did it feel?"
          />
        </label>
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
        <button type="submit" className="btn btn--secondary">
          Add photos
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

      {chapter.stories.length > 0 && (
        <section className="panel">
          <h2>Recent stories</h2>
          <ul className="story-preview-list">
            {chapter.stories.slice(0, 3).map((story) => (
              <li key={story.id}>
                <strong>{story.title}</strong>
                <p className="muted">{story.body.slice(0, 120)}…</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
