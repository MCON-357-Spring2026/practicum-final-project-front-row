/**
 * This file implements CRUD for journal entries.
 * Journal entries are stored in the "stories" table (see docs/DATA_MODEL.md).
 */

import { query } from '../db.js';

/**
 * Ensures the chapter belongs to the signed-in user before any journal change.
 */
async function assertChapterOwnedByUser(chapterId, userId) {
  const result = await query(
    `SELECT id FROM chapters WHERE id = $1 AND user_id = $2`,
    [chapterId, userId],
  );

  if (result.rowCount === 0) {
    const error = new Error('Chapter not found or access denied');
    error.status = 404;
    throw error;
  }
}

/**
 * Ensures a journal row exists and belongs to the user via its chapter.
 */
async function getOwnedEntry(entryId, userId) {
  const result = await query(
    `SELECT s.id, s.chapter_id, s.title, s.body, s.mood, s.created_at, s.updated_at
     FROM stories s
     INNER JOIN chapters c ON c.id = s.chapter_id
     WHERE s.id = $1 AND c.user_id = $2`,
    [entryId, userId],
  );

  const row = result.rows[0];
  if (!row) {
    const error = new Error('Journal entry not found');
    error.status = 404;
    throw error;
  }

  return mapEntry(row);
}

function mapEntry(row) {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    body: row.body,
    mood: row.mood,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Lists journal entries for the current user, optionally filtered by chapter.
 */
export async function listJournalEntries(userId, { chapterId } = {}) {
  if (chapterId) {
    await assertChapterOwnedByUser(chapterId, userId);
  }

  const params = [userId];
  let sql = `
    SELECT s.id, s.chapter_id, s.title, s.body, s.mood, s.created_at, s.updated_at
    FROM stories s
    INNER JOIN chapters c ON c.id = s.chapter_id
    WHERE c.user_id = $1
  `;

  if (chapterId) {
    params.push(chapterId);
    sql += ` AND s.chapter_id = $2`;
  }

  sql += ' ORDER BY s.created_at DESC';

  const result = await query(sql, params);
  return result.rows.map(mapEntry);
}

export async function getJournalEntry(userId, entryId) {
  return getOwnedEntry(entryId, userId);
}

export async function createJournalEntry(userId, { chapterId, title, body, mood }) {
  await assertChapterOwnedByUser(chapterId, userId);

  const result = await query(
    `INSERT INTO stories (chapter_id, title, body, mood)
     VALUES ($1, $2, $3, $4)
     RETURNING id, chapter_id, title, body, mood, created_at, updated_at`,
    [chapterId, title.trim(), body.trim(), mood?.trim() || null],
  );

  return mapEntry(result.rows[0]);
}

export async function updateJournalEntry(userId, entryId, { title, body, mood }) {
  await getOwnedEntry(entryId, userId);

  const result = await query(
    `UPDATE stories
     SET title = COALESCE($1, title),
         body = COALESCE($2, body),
         mood = COALESCE($3, mood),
         updated_at = now()
     WHERE id = $4
     RETURNING id, chapter_id, title, body, mood, created_at, updated_at`,
    [
      title !== undefined ? title.trim() : null,
      body !== undefined ? body.trim() : null,
      mood !== undefined ? (mood === null ? null : mood.trim()) : null,
      entryId,
    ],
  );

  return mapEntry(result.rows[0]);
}

export async function deleteJournalEntry(userId, entryId) {
  await getOwnedEntry(entryId, userId);
  await query('DELETE FROM stories WHERE id = $1', [entryId]);
}
