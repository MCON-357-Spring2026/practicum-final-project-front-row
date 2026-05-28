/**
 * Life Chapter Dashboard — pick a template (College, Dating, etc.)
 * or reopen chapters the user already started.
 */

import { useState } from 'react';
import { CHAPTER_TEMPLATES } from '../constants/chapterTemplates.js';

export function ChapterDashboard({
  user,
  chapters,
  onSignOut,
  onStartChapter,
  onOpenJournal,
  onOpenScrapbook,
}) {
  const [customTitle, setCustomTitle] = useState('');

  function handleStart(template) {
    if (template.id === 'custom' && !customTitle.trim()) {
      return;
    }
    onStartChapter(template, customTitle);
    setCustomTitle('');
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
                  <div>
                    <strong>{chapter.title}</strong>
                    <p className="muted">
                      {chapter.stories.length} stories · {chapter.goals.length} goals
                      · {chapter.photos.length} photos
                    </p>
                  </div>
                </div>
                <div className="chapter-row__actions">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onOpenJournal(chapter.id)}
                  >
                    Journal
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => onOpenScrapbook(chapter.id)}
                  >
                    Scrapbook
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
