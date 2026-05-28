/**
 * This migration lets a chapter remember which dashboard template it came from
 * and the emoji shown next to its title in the UI.
 * Run after the earlier migrations: npm run migrate
 */

/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.addColumns('chapters', {
    emoji: { type: 'text' },
    template_id: { type: 'text' },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropColumns('chapters', ['emoji', 'template_id']);
};
