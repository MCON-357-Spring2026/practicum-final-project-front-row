/**
 * This file implements CRUD for chapter goals.
 * Goals always belong to a chapter, which in turn belongs to a user, so every
 * query is scoped through the owning chapter to prevent cross-account access.
 */

import { query } from '../db.js';

/**
 * Ensures the chapter belongs to the signed-in user before any goal change.
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
 * Loads a goal and confirms it belongs to the user via its chapter.
 */
async function getOwnedGoal(goalId, userId) {
  const result = await query(
    `SELECT g.id, g.chapter_id, g.title, g.notes, g.is_completed, g.created_at, g.completed_at
     FROM goals g
     INNER JOIN chapters c ON c.id = g.chapter_id
     WHERE g.id = $1 AND c.user_id = $2`,
    [goalId, userId],
  );

  const row = result.rows[0];
  if (!row) {
    const error = new Error('Goal not found');
    error.status = 404;
    throw error;
  }

  return mapGoal(row);
}

function mapGoal(row) {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    notes: row.notes,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

/**
 * Lists goals for the current user, optionally filtered by chapter.
 */
export async function listGoals(userId, { chapterId } = {}) {
  if (chapterId) {
    await assertChapterOwnedByUser(chapterId, userId);
  }

  const params = [userId];
  let sql = `
    SELECT g.id, g.chapter_id, g.title, g.notes, g.is_completed, g.created_at, g.completed_at
    FROM goals g
    INNER JOIN chapters c ON c.id = g.chapter_id
    WHERE c.user_id = $1
  `;

  if (chapterId) {
    params.push(chapterId);
    sql += ` AND g.chapter_id = $2`;
  }

  sql += ' ORDER BY g.created_at ASC';

  const result = await query(sql, params);
  return result.rows.map(mapGoal);
}

export async function createGoal(userId, { chapterId, title, notes }) {
  await assertChapterOwnedByUser(chapterId, userId);

  const result = await query(
    `INSERT INTO goals (chapter_id, title, notes)
     VALUES ($1, $2, $3)
     RETURNING id, chapter_id, title, notes, is_completed, created_at, completed_at`,
    [chapterId, title.trim(), notes?.trim() || null],
  );

  return mapGoal(result.rows[0]);
}

/**
 * Updates a goal's text and/or completion state. Setting isCompleted also keeps
 * completed_at in sync so the scrapbook can show when a goal was achieved.
 */
export async function updateGoal(userId, goalId, { title, notes, isCompleted }) {
  await getOwnedGoal(goalId, userId);

  const result = await query(
    `UPDATE goals
     SET title = COALESCE($1, title),
         notes = COALESCE($2, notes),
         is_completed = COALESCE($3, is_completed),
         completed_at = CASE
           WHEN $3 IS NULL THEN completed_at
           WHEN $3 = true THEN now()
           ELSE NULL
         END
     WHERE id = $4
     RETURNING id, chapter_id, title, notes, is_completed, created_at, completed_at`,
    [
      title !== undefined ? title.trim() : null,
      notes !== undefined ? (notes === null ? null : notes.trim()) : null,
      isCompleted !== undefined ? isCompleted : null,
      goalId,
    ],
  );

  return mapGoal(result.rows[0]);
}

export async function deleteGoal(userId, goalId) {
  await getOwnedGoal(goalId, userId);
  await query('DELETE FROM goals WHERE id = $1', [goalId]);
}
