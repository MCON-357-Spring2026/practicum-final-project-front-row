/**
 * Scrapbook View — read-only curated layout built from journal entries.
 * This is what users would share as a digital scrapbook page.
 */

import { useState } from 'react';

export function ScrapbookView({ chapter, onBack }) {
  const [shareMessage, setShareMessage] = useState('');
  const completedGoals = chapter.goals.filter((g) => g.isCompleted).length;
  const subtitle =
    chapter.stories.length > 0
      ? chapter.stories[0].body.slice(0, 80)
      : 'Add journal entries to fill your scrapbook.';

  function showShareMessage(text) {
    setShareMessage(text);
    window.setTimeout(() => setShareMessage(''), 2500);
  }

  /**
   * Builds a plain-text snapshot of the chapter the user can paste anywhere.
   */
  function buildShareText() {
    const lines = [
      `${chapter.emoji ? `${chapter.emoji} ` : ''}${chapter.title} — a Chapterly scrapbook`,
      '',
    ];

    if (chapter.stories.length > 0) {
      lines.push('Stories:');
      chapter.stories.forEach((story) => {
        lines.push(`• ${story.title}: ${story.body}`);
      });
      lines.push('');
    }

    if (chapter.goals.length > 0) {
      lines.push(`Goals (${completedGoals}/${chapter.goals.length} complete):`);
      chapter.goals.forEach((goal) => {
        lines.push(`${goal.isCompleted ? '✓' : '○'} ${goal.title}`);
      });
      lines.push('');
    }

    lines.push(
      `${chapter.stories.length} stories · ${chapter.goals.length} goals · ${chapter.photos.length} photos`,
    );

    return lines.join('\n').trim();
  }

  async function handleShare() {
    const text = buildShareText();

    try {
      await navigator.clipboard.writeText(text);
      showShareMessage('Scrapbook copied to clipboard!');
    } catch {
      // Older browsers or insecure contexts (no Clipboard API): fall back to a
      // temporary textarea + execCommand so copy still works.
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      showShareMessage(copied ? 'Scrapbook copied to clipboard!' : 'Could not copy.');
    }
  }

  return (
    <div className="page">
      <header className="page-header page-header--compact">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="page-header__row">
          <div>
            <h1>
              {chapter.emoji} Scrapbook · {chapter.title}
            </h1>
            <p className="muted">Auto-curated from your journal entries.</p>
          </div>
          <button type="button" className="btn btn--secondary" onClick={handleShare}>
            Share
          </button>
        </div>
      </header>

      {shareMessage && (
        <p className="toast" role="status">
          {shareMessage}
        </p>
      )}

      <article className="scrapbook" aria-label={`${chapter.title} scrapbook`}>
        <header className="scrapbook__cover">
          <p className="scrapbook__kicker">Life Chapter</p>
          <h2>{chapter.title}</h2>
          <p className="scrapbook__subtitle">{subtitle}</p>
        </header>

        <div className="scrapbook__grid">
          <section className="scrapbook__photos" aria-label="Photo collage">
            {chapter.photos.length === 0 ? (
              <div className="scrapbook__placeholder">Photos appear here</div>
            ) : (
              chapter.photos.map((photo) => (
                <figure key={photo.id} className="scrapbook__photo">
                  <img src={photo.previewUrl} alt={photo.caption || photo.name} />
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))
            )}
          </section>

          <section className="scrapbook__stories" aria-label="Stories">
            {chapter.stories.length === 0 ? (
              <p className="scrapbook__empty">No stories yet — visit the journal.</p>
            ) : (
              chapter.stories.map((story) => (
                <article key={story.id} className="scrapbook__story-card">
                  <time dateTime={story.createdAt}>
                    {new Date(story.createdAt).toLocaleDateString()}
                  </time>
                  <h3>{story.title}</h3>
                  <p>{story.body}</p>
                </article>
              ))
            )}
          </section>

          <aside className="scrapbook__goals" aria-label="Chapter goals">
            <h3>Goals</h3>
            {chapter.goals.length === 0 ? (
              <p className="muted">No goals yet.</p>
            ) : (
              <>
                <p className="scrapbook__goal-stats">
                  {completedGoals} of {chapter.goals.length} complete
                </p>
                <ul>
                  {chapter.goals.map((goal) => (
                    <li key={goal.id} className={goal.isCompleted ? 'done' : ''}>
                      {goal.isCompleted ? '✓' : '○'} {goal.title}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
}
