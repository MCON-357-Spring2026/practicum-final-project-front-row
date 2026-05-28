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
