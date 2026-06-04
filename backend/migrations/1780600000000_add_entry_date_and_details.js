/**
 * This migration adds richer metadata to journal entries (stories):
 *  - entry_date: the date the user says the entry is about (separate from created_at)
 *  - details:    template-specific structured fields (e.g. date number, restaurant,
 *                company, role) stored as flexible JSON so each chapter type can
 *                collect its own personalized prompts.
 * Run after the earlier migrations: npm run migrate
 */

/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.addColumns('stories', {
    entry_date: { type: 'date' },
    details: { type: 'jsonb', notNull: true, default: '{}' },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropColumns('stories', ['entry_date', 'details']);
};
