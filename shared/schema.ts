import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Extended user schema with profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  profilePicture: text("profile_picture"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
});

// Social account connections
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(), // twitter, instagram, linkedin, facebook
  accountId: text("account_id").notNull(),
  accessToken: text("access_token").notNull(),
  username: text("username").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// User settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  theme: text("theme").notNull().default("system"),
  contentLanguage: text("content_language").notNull().default("en"),
  autoSchedule: boolean("auto_schedule").notNull().default(false),
});

// New table for content generation history
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  platform: text("platform").notNull(),
  generatedAt: text("generated_at").notNull().default(new Date().toISOString()),
  hashtags: text("hashtags").array(),
  engagement_prediction: integer("engagement_prediction"),
  tone: text("tone"),
});

export const sentimentSchema = z.object({
  label: z.string(),
  score: z.number(),
});

export type Sentiment = z.infer<typeof sentimentSchema>;

export const contentAnalysis = pgTable("content_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  sentiment: jsonb("sentiment").notNull().$type<Sentiment>(),
  hashtags: text("hashtags").array().notNull(),
  engagementScore: integer("engagement_score").notNull(),
  createdAt: text("created_at").notNull(),
});

export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  platform: text("platform").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  status: text("status").notNull().default("pending"),
  hashtags: text("hashtags").array().notNull(),
  engagementPrediction: integer("engagement_prediction").notNull(),
  tone: text("tone").notNull(),
  createdAt: text("created_at").notNull(),
});

// Updated user schema with additional fields
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
  })
  .extend({
    email: z.string().email().optional(),
  });

// Social account schema
export const socialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
});

// User settings schema
export const userSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
}).extend({
  theme: z.enum(["light", "dark", "system"]),
  contentLanguage: z.enum(["en", "es", "fr", "de"]),
});

export const contentAnalysisSchema = createInsertSchema(contentAnalysis)
  .pick({
    content: true,
  })
  .extend({
    content: z.string().min(1).max(2000),
  });

export const scheduledPostSchema = createInsertSchema(scheduledPosts)
  .pick({
    content: true,
    platform: true,
    scheduledTime: true,
  })
  .extend({
    platform: z.enum(["twitter", "instagram", "linkedin", "facebook"]),
    content: z.string().min(1, "Content is required"),
    scheduledTime: z.string().min(1, "Scheduled time is required")
  });

// Add new types for content history
export const insertContentHistorySchema = createInsertSchema(contentHistory)
  .omit({
    id: true,
    generatedAt: true,
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof socialAccountSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof userSettingsSchema>;
export type ContentAnalysis = typeof contentAnalysis.$inferSelect;
export type InsertContentAnalysis = z.infer<typeof contentAnalysisSchema>;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof scheduledPostSchema>;
export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = z.infer<typeof insertContentHistorySchema>;