/**
 * Life Chapter Dashboard — pick a template (College, Dating, etc.)
 * or reopen chapters the user already started.
 */

import { useState } from 'react';
import { CHAPTER_TEMPLATES, getTemplateById } from '../constants/chapterTemplates.js';

export function ChapterDashboard({
  user,
  chapters,
  onSignOut,
  onStartChapter,
  onOpenJournal,
  onOpenScrapbook,
  onOpenChapter,
  onRenameChapter,
  onDeleteChapter,
}) {
  const [customTitle, setCustomTitle] = useState('');

  // Tracks which chapter is being renamed inline (null = none) and its draft name.
  const [renamingId, setRenamingId] = useState(null);
  const [draftName, setDraftName] = useState('');

  function handleStart(template) {
    if (template.id === 'custom' && !customTitle.trim()) {
      return;
    }
    onStartChapter(template, customTitle);
    setCustomTitle('');
  }

  // Open the inline name editor for a chapter, pre-filled with its current name.
  function startRename(chapter) {
    setRenamingId(chapter.id);
    setDraftName(chapter.title);
  }

  // Save the new name, then close the editor.
  async function saveRename(chapterId) {
    if (!draftName.trim()) {
      return;
    }
    await onRenameChapter(chapterId, draftName.trim());
    setRenamingId(null);
    setDraftName('');
  }

  // Delete a chapter (and everything in it) after a quick confirmation.
  async function handleDelete(chapter) {
    const confirmed = window.confirm(
      `Delete "${chapter.title}"? This also removes its stories, goals, and photos.`,
    );
    if (!confirmed) {
      return;
    }
    await onDeleteChapter(chapter.id);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Chapterly</h1>
          <p className="muted">Hi, {user.displayName}</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onSignOut}>
          Sign out
        </button>
      </header>

      <section aria-labelledby="templates-heading">
        <h2 id="templates-heading">Start a life chapter</h2>
        <p className="section-lead">
          Each chapter is its own journal and scrapbook. Pick a template to begin.
        </p>

        <div className="template-grid">
          {CHAPTER_TEMPLATES.map((template) => (
            <article key={template.id} className="template-card">
              <span className="template-card__emoji" aria-hidden="true">
                {template.emoji}
              </span>
              <h3>{template.title}</h3>
              <p className="muted">{template.blurb}</p>

              {template.id === 'custom' ? (
                <label className="field field--compact">
                  <span className="sr-only">Custom chapter title</span>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Semester abroad"
                  />
                </label>
              ) : null}

              <button
                type="button"
                className="btn btn--secondary btn--block"
                onClick={() => handleStart(template)}
              >
                Start
              </button>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="active-heading">
        <h2 id="active-heading">Your chapters</h2>

        {chapters.length === 0 ? (
          <p className="empty-state">
            No chapters yet. Choose a template above to create your first scrapbook.
          </p>
        ) : (
          <ul className="chapter-list">
            {chapters.map((chapter) => (
              <li key={chapter.id} className="chapter-row">
                <div className="chapter-row__main">
                  <span aria-hidden="true">{chapter.emoji}</span>
                  {renamingId === chapter.id ? (
                    // Inline editor for renaming this chapter.
                    <div className="chapter-rename">
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Chapter name"
                        aria-label="Chapter name"
                      />
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => saveRename(chapter.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => setRenamingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // Click the chapter to open its regular reading view.
                    <button
                      type="button"
                      className="chapter-open"
                      onClick={() => onOpenChapter(chapter.id)}
                    >
                      <strong>{chapter.title}</strong>
                      {/* The chapter "type" (its template) shown under the name. */}
                      {getTemplateById(chapter.templateId) && (
                        <span className="chapter-type">
                          {getTemplateById(chapter.templateId).title}
                        </span>
                      )}
                      <span className="muted">
                        {chapter.stories.length} stories · {chapter.goals.length} goals
                        · {chapter.photos.length} photos
                      </span>
                    </button>
                  )}
                </div>
                <div className="chapter-row__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => startRename(chapter)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onOpenJournal(chapter.id)}
                  >
                    Add story
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => onOpenScrapbook(chapter.id)}
                  >
                    Scrapbook
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => handleDelete(chapter)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
