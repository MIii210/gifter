import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const notebooks = sqliteTable('notebooks', { owner: text('owner').primaryKey(), data: text('data').notNull(), revision: integer('revision').notNull().default(0) });
export const surveys = sqliteTable('surveys', { token: text('token').primaryKey(), owner: text('owner').notNull(), friendId: text('friend_id').notNull(), kind: text('kind').notNull(), created: text('created').notNull(), result: text('result') });
