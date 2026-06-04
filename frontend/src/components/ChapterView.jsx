/**
 * Chapter View — the "regular" reading view for a single chapter.
 *
 * Shows every journal entry (with its date, mood, and personalized prompt
 * values) and lets the user edit or delete each one inline. New entries are
 * written from the separate "Add story" form (JournalEntryForm).
 */

import { useState } from 'react';
import { getChapterFields } from '../constants/chapterTemplates.js';

export function ChapterView({
  chapter,
  onBack,
  onAddStory,
  onOpenScrapbook,
  onEditStory,
  onDeleteStory,
}) {
  // Personalized prompts for this chapter type (used to label saved details).
  const templateFields = getChapterFields(chapter.templateId);

  // Tracks which entry is being edited inline (null = none) and its draft text.
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [message, setMessage] = useState('');

  // Open the inline editor for an entry, pre-filled with its current text.
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

  // Save the edited entry via the parent's handler.
  async function handleSaveEdit(entryId) {
    if (!editTitle.trim() || !editBody.trim()) {
      setMessage('Add both a title and story text.');
      return;
    }
    try {
      await onEditStory(entryId, { title: editTitle, body: editBody });
      cancelEdit();
    } catch (err) {
      setMessage(err.message || 'Could not update story.');
    }
  }

  // Delete an entry after a quick confirmation.
  async function handleDelete(entryId) {
    if (!window.confirm('Delete this story?')) {
      return;
    }
    try {
      await onDeleteStory(entryId);
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
            {chapter.emoji} {chapter.title}
          </h1>
          <p className="muted">
            {chapter.stories.length} stories · {chapter.goals.length} goals ·{' '}
            {chapter.photos.length} photos
          </p>
        </div>
        <div className="chapter-row__actions">
          <button type="button" className="btn btn--primary" onClick={onAddStory}>
            + Add story
          </button>
          <button type="button" className="btn btn--secondary" onClick={onOpenScrapbook}>
            Scrapbook
          </button>
        </div>
      </header>

      {message && (
        <p className="toast" role="status">
          {message}
        </p>
      )}

      <section className="panel">
        <h2>Journal entries</h2>

        {chapter.stories.length === 0 ? (
          <p className="empty-state">
            No entries yet. Use “Add story” to write your first one.
          </p>
        ) : (
          <ul className="story-preview-list">
            {chapter.stories.map((story) => (
              <li key={story.id}>
                {editingId === story.id ? (
                  // Inline edit form for this entry.
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
                      <button type="button" className="btn btn--ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Read-only view with Edit and Delete actions.
                  <>
                    <strong>{story.title}</strong>
                    {story.entryDate && (
                      <p className="muted">
                        {new Date(story.entryDate).toLocaleDateString()}
                        {story.mood ? ` · ${story.mood}` : ''}
                      </p>
                    )}
                    {/* Personalized prompt values saved with this entry. */}
                    {templateFields
                      .filter((field) => story.details?.[field.name])
                      .map((field) => (
                        <p className="muted" key={field.name}>
                          <strong>{field.label}:</strong> {story.details[field.name]}
                        </p>
                      ))}
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
        )}
      </section>
    </div>
  );
}
