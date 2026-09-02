import { relations } from 'drizzle-orm';
import { pgTable, text, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  _id: text('_id').primaryKey(),
  clerkUserId: text('clerkUserId').notNull().unique(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  img: text('img'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  savedPosts: many(savedPosts),
}));

export const posts = pgTable('posts', {
  _id: text('_id').primaryKey(),
  userId: text('userId').references(() => users._id, { onDelete: 'cascade' }).notNull(),
  img: text('img'),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  desc: text('desc'),
  category: text('category').default('general'),
  content: text('content').notNull(),
  isFeatured: boolean('isFeatured').default(false),
  visit: integer('visit').default(0),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users._id] }),
  comments: many(comments),
  savedBy: many(savedPosts),
}));

export const comments = pgTable('comments', {
  _id: text('_id').primaryKey(),
  userId: text('userId').references(() => users._id, { onDelete: 'cascade' }).notNull(),
  postId: text('postId').references(() => posts._id, { onDelete: 'cascade' }).notNull(),
  desc: text('desc').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users._id] }),
  post: one(posts, { fields: [comments.postId], references: [posts._id] }),
}));

export const savedPosts = pgTable('savedPosts', {
  userId: text('userId').references(() => users._id, { onDelete: 'cascade' }).notNull(),
  postId: text('postId').references(() => posts._id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.postId] }),
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  user: one(users, { fields: [savedPosts.userId], references: [users._id] }),
  post: one(posts, { fields: [savedPosts.postId], references: [posts._id] }),
}));

export type PostType = typeof posts.$inferSelect;
export type UserType = typeof users.$inferSelect;
export type CommentType = typeof comments.$inferSelect;
export type SavedPostType = typeof savedPosts.$inferSelect;

export type PostWithUser = PostType & {
  user: UserType | null;
};

export type CommentWithUser = CommentType & {
  user: {
    username: string;
    img: string | null;
  };
};


