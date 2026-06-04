/**
 * This file provides minimal chapter helpers so users can create a chapter
 * before adding journal entries (entries always belong to a chapter).
 */

import { query } from '../db.js';

function mapChapter(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    emoji: row.emoji,
    templateId: row.template_id,
    startedOn: row.started_on,
    endedOn: row.ended_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listChapters(userId) {
  const result = await query(
    `SELECT id, title, summary, emoji, template_id, started_on, ended_on, created_at, updated_at
     FROM chapters
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows.map(mapChapter);
}

// Renames a chapter (only if it belongs to the user). Returns null when missing.
export async function updateChapter(userId, chapterId, { title }) {
  const result = await query(
    `UPDATE chapters
     SET title = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING id, title, summary, emoji, template_id, started_on, ended_on, created_at, updated_at`,
    [title.trim(), chapterId, userId],
  );

  return result.rows[0] ? mapChapter(result.rows[0]) : null;
}

// Deletes a chapter the user owns. Its stories, goals, and photos are removed
// automatically by the ON DELETE CASCADE foreign keys. Returns true when a row
// was actually deleted (false when the chapter is missing or not owned).
export async function deleteChapter(userId, chapterId) {
  const result = await query(
    `DELETE FROM chapters WHERE id = $1 AND user_id = $2`,
    [chapterId, userId],
  );

  return result.rowCount > 0;
}

export async function createChapter(
  userId,
  { title, summary, emoji, templateId, startedOn, endedOn },
) {
  const result = await query(
    `INSERT INTO chapters (user_id, title, summary, emoji, template_id, started_on, ended_on)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, summary, emoji, template_id, started_on, ended_on, created_at, updated_at`,
    [
      userId,
      title.trim(),
      summary?.trim() || null,
      emoji?.trim() || null,
      templateId?.trim() || null,
      startedOn || null,
      endedOn || null,
    ],
  );

  return mapChapter(result.rows[0]);
}
