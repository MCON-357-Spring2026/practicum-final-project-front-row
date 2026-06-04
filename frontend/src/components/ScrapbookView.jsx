/**
 * Scrapbook View — read-only curated layout built from journal entries.
 * This is what users would share as a digital scrapbook page.
 */

import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getChapterFields } from '../constants/chapterTemplates.js';

export function ScrapbookView({ chapter, onBack }) {
  const [shareMessage, setShareMessage] = useState('');
  // The scrapbook page element we snapshot when exporting to PDF.
  const scrapbookRef = useRef(null);
  // Personalized prompt fields for this chapter type (used to label details).
  const templateFields = getChapterFields(chapter.templateId);
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

  /**
   * Renders the scrapbook page to an image and saves it as a multi-page PDF.
   */
  async function handleDownloadPdf() {
    const node = scrapbookRef.current;
    if (!node) return;

    showShareMessage('Building your PDF…');
    try {
      // Snapshot the scrapbook DOM (useCORS lets remote Cloudinary photos render).
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fffdf9',
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');

      // Fit the whole scrapbook on one page: scale by the smaller ratio so it
      // never overflows, then center it on the page.
      const margin = 24;
      const ratio = Math.min(
        (pageWidth - margin * 2) / canvas.width,
        (pageHeight - margin * 2) / canvas.height,
      );
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      pdf.save(`${chapter.title} scrapbook.pdf`);
      showShareMessage('PDF downloaded!');
    } catch {
      showShareMessage('Could not build the PDF.');
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
          <div className="scrapbook__actions">
            <button type="button" className="btn btn--primary" onClick={handleDownloadPdf}>
              ⬇ Download PDF
            </button>
            <button type="button" className="btn btn--secondary" onClick={handleShare}>
              Copy
            </button>
          </div>
        </div>
      </header>

      {shareMessage && (
        <p className="toast" role="status">
          {shareMessage}
        </p>
      )}

      <article
        className="scrapbook"
        aria-label={`${chapter.title} scrapbook`}
        ref={scrapbookRef}
      >
        <header className="scrapbook__cover">
          {chapter.emoji && (
            <span className="scrapbook__cover-emoji" aria-hidden="true">
              {chapter.emoji}
            </span>
          )}
          <p className="scrapbook__kicker">Life Chapter</p>
          <h2>{chapter.title}</h2>
          <p className="scrapbook__subtitle">{subtitle}</p>
        </header>

        <div
          className={
            chapter.photos.length === 0
              ? 'scrapbook__grid scrapbook__grid--no-photos'
              : 'scrapbook__grid'
          }
        >
          {/* Only show the photo collage when the chapter actually has photos. */}
          {chapter.photos.length > 0 && (
            <section className="scrapbook__photos" aria-label="Photo collage">
              {chapter.photos.map((photo) => (
                <figure key={photo.id} className="scrapbook__photo">
                  <img src={photo.previewUrl} alt={photo.caption || photo.name} />
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </section>
          )}

          <section className="scrapbook__stories" aria-label="Stories">
            {chapter.stories.length === 0 ? (
              <p className="scrapbook__empty">No stories yet — visit the journal.</p>
            ) : (
              chapter.stories.map((story) => (
                <article key={story.id} className="scrapbook__story-card">
                  <div className="scrapbook__story-head">
                    <time dateTime={story.entryDate || story.createdAt}>
                      {new Date(story.entryDate || story.createdAt).toLocaleDateString()}
                    </time>
                    {/* Mood pill — shows the chosen emoji + label. */}
                    {story.mood && <span className="mood-badge">{story.mood}</span>}
                  </div>
                  <h3>{story.title}</h3>
                  {/* Personalized prompt values saved with this entry, as chips. */}
                  {templateFields.some((field) => story.details?.[field.name]) && (
                    <div className="scrapbook__details">
                      {templateFields
                        .filter((field) => story.details?.[field.name])
                        .map((field) => (
                          <span className="detail-chip" key={field.name}>
                            <strong>{field.label}:</strong> {story.details[field.name]}
                          </span>
                        ))}
                    </div>
                  )}
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
