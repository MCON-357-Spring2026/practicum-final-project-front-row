/**
 * This file uploads images to Cloudinary and saves photo metadata in PostgreSQL.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.
 */

import { v2 as cloudinary } from 'cloudinary';
import { query } from '../db.js';

let configured = false;

function ensureCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const error = new Error('Cloudinary is not configured');
    error.status = 503;
    throw error;
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
}

/**
 * Uploads a buffer to Cloudinary and inserts a row in the photos table.
 */
export async function uploadChapterPhoto(userId, { chapterId, caption, fileBuffer }) {
  ensureCloudinaryConfigured();

  // Confirm the chapter belongs to this user before storing media for it.
  const chapterCheck = await query(
    'SELECT id FROM chapters WHERE id = $1 AND user_id = $2',
    [chapterId, userId],
  );

  if (chapterCheck.rowCount === 0) {
    const error = new Error('Chapter not found or access denied');
    error.status = 404;
    throw error;
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'chapterly' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(fileBuffer);
  });

  const insert = await query(
    `INSERT INTO photos (chapter_id, external_url, cloudinary_public_id, caption)
     VALUES ($1, $2, $3, $4)
     RETURNING id, chapter_id, external_url, cloudinary_public_id, caption, sort_order, created_at`,
    [chapterId, uploadResult.secure_url, uploadResult.public_id, caption?.trim() || null],
  );

  const row = insert.rows[0];
  return {
    id: row.id,
    chapterId: row.chapter_id,
    url: row.external_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

/**
 * Lists photos for chapters owned by the user.
 */
export async function listPhotos(userId, chapterId) {
  const params = [userId];
  let sql = `
    SELECT p.id, p.chapter_id, p.external_url, p.cloudinary_public_id, p.caption, p.sort_order, p.created_at
    FROM photos p
    INNER JOIN chapters c ON c.id = p.chapter_id
    WHERE c.user_id = $1
  `;

  if (chapterId) {
    params.push(chapterId);
    sql += ' AND p.chapter_id = $2';
  }

  sql += ' ORDER BY p.sort_order ASC, p.created_at DESC';

  const result = await query(sql, params);
  return result.rows.map((row) => ({
    id: row.id,
    chapterId: row.chapter_id,
    url: row.external_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }));
}

/**
 * Deletes a photo from Cloudinary (when possible) and from the database.
 */
export async function deletePhoto(userId, photoId) {
  const result = await query(
    `SELECT p.id, p.cloudinary_public_id
     FROM photos p
     INNER JOIN chapters c ON c.id = p.chapter_id
     WHERE p.id = $1 AND c.user_id = $2`,
    [photoId, userId],
  );

  const row = result.rows[0];
  if (!row) {
    const error = new Error('Photo not found');
    error.status = 404;
    throw error;
  }

  if (row.cloudinary_public_id) {
    ensureCloudinaryConfigured();
    await cloudinary.uploader.destroy(row.cloudinary_public_id);
  }

  await query('DELETE FROM photos WHERE id = $1', [photoId]);
}
