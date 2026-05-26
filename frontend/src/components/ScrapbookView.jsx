/**
 * Scrapbook View — read-only curated layout built from journal entries.
 * This is what users would share as a digital scrapbook page.
 */

export function ScrapbookView({ chapter, onBack }) {
  const completedGoals = chapter.goals.filter((g) => g.isCompleted).length;
  const subtitle =
    chapter.stories.length > 0
      ? chapter.stories[0].body.slice(0, 80)
      : 'Add journal entries to fill your scrapbook.';

  function handleShare() {
    // Placeholder for a future share link or export.
    const summary = `${chapter.title}: ${chapter.stories.length} stories, ${chapter.photos.length} photos`;
    if (navigator.share) {
      navigator.share({ title: `Chapterly — ${chapter.title}`, text: summary });
      return;
    }
    window.alert(`Share preview: ${summary}`);
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
