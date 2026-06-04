/**
 * This migration adds fields needed for password auth and Cloudinary photo storage.
 * Run after the initial schema migration: npm run migrate
 */

/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // Bcrypt hash of the user's password (never store plain text passwords).
  pgm.addColumns('users', {
    password_hash: { type: 'text' },
  });

  // Cloudinary identifiers so we can delete or transform images later.
  pgm.addColumns('photos', {
    cloudinary_public_id: { type: 'text' },
  });

  // Optional mood/tag for scrapbook sorting (journal entry metadata).
  pgm.addColumns('stories', {
    mood: { type: 'text' },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropColumns('stories', ['mood', 'updated_at']);
  pgm.dropColumns('photos', ['cloudinary_public_id']);
  pgm.dropColumns('users', ['password_hash']);
};
