/**
 * Journal Entry Form — daily stories, photo uploads, and chapter goals.
 * Submissions update the active chapter in parent state (then localStorage).
 */

import { useState } from 'react';

export function JournalEntryForm({
  chapter,
  onBack,
  onAddStory,
  onEditStory,
  onDeleteStory,
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
  const [uploading, setUploading] = useState(false);

  // Tracks which story is being edited inline (null = none) and its draft text.
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  function showSaved(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  }

  async function handleSaveStory(event) {
    event.preventDefault();
    if (!storyTitle.trim() || !storyBody.trim()) {
      setMessage('Add both a title and story text.');
      return;
    }

    try {
      await onAddStory({ title: storyTitle, body: storyBody });
      setStoryTitle('');
      setStoryBody('');
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

  // Open the inline editor for a story and pre-fill it with current text.
  function startEdit(story) {
    setEditingId(story.id);
    setEditTitle(story.title);
    setEditBody(story.body);
  }

  // Close the inline editor without saving.
  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditBody('');
  }

  // Save the edited story via the API.
  async function handleSaveEdit(entryId) {
    if (!editTitle.trim() || !editBody.trim()) {
      setMessage('Add both a title and story text.');
      return;
    }

    try {
      await onEditStory(entryId, { title: editTitle, body: editBody });
      cancelEdit();
      showSaved('Story updated.');
    } catch (err) {
      setMessage(err.message || 'Could not update story.');
    }
  }

  // Delete a story after a quick confirmation.
  async function handleDelete(entryId) {
    if (!window.confirm('Delete this story?')) {
      return;
    }

    try {
      await onDeleteStory(entryId);
      showSaved('Story deleted.');
    } catch (err) {
      setMessage(err.message || 'Could not delete story.');
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

      {chapter.stories.length > 0 && (
        <section className="panel">
          <h2>Your stories</h2>
          <ul className="story-preview-list">
            {chapter.stories.map((story) => (
              <li key={story.id}>
                {editingId === story.id ? (
                  // Inline edit form for this story.
                  <div className="stack-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      rows={3}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                    />
                    <div className="chapter-row__actions">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => handleSaveEdit(story.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Read-only view with Edit and Delete actions.
                  <>
                    <strong>{story.title}</strong>
                    <p className="muted">{story.body}</p>
                    <div className="chapter-row__actions">
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => startEdit(story)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => handleDelete(story.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
