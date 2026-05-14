/**
 * This migration creates the first Chapterly tables in PostgreSQL.
 * Order of creation respects foreign keys: users -> chapters -> stories/goals/photos.
 * Run via: npm run migrate (requires DATABASE_URL in .env).
 */

/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
export const shorthands = undefined;

/**
 * Applies the initial schema: accounts, life chapters, and content rows per chapter.
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // One row per person using the app (authentication can be wired up later).
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'text', notNull: true, unique: true },
    display_name: { type: 'text' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // A "chapter" is a season of life (for example college) owned by a single user.
  pgm.createTable('chapters', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    summary: { type: 'text' },
    started_on: { type: 'date' },
    ended_on: { type: 'date' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Speeds up "all chapters for this user" queries.
  pgm.createIndex('chapters', 'user_id');

  // Long-form memories attached to a chapter.
  pgm.createTable('stories', {
    id: 'id',
    chapter_id: {
      type: 'integer',
      notNull: true,
      references: 'chapters',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    body: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('stories', 'chapter_id');

  // Personal goals scoped to a chapter (for example "visit campus career fair").
  pgm.createTable('goals', {
    id: 'id',
    chapter_id: {
      type: 'integer',
      notNull: true,
      references: 'chapters',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    notes: { type: 'text' },
    is_completed: { type: 'boolean', notNull: true, default: false },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    completed_at: { type: 'timestamptz' },
  });

  pgm.createIndex('goals', 'chapter_id');

  // Photo references: store a public URL for now (Cloudinary or another host later).
  pgm.createTable('photos', {
    id: 'id',
    chapter_id: {
      type: 'integer',
      notNull: true,
      references: 'chapters',
      onDelete: 'CASCADE',
    },
    external_url: { type: 'text', notNull: true },
    caption: { type: 'text' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('photos', 'chapter_id');
};

/**
 * Drops tables in reverse dependency order so foreign keys stay valid.
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropTable('photos');
  pgm.dropTable('goals');
  pgm.dropTable('stories');
  pgm.dropTable('chapters');
  pgm.dropTable('users');
};
