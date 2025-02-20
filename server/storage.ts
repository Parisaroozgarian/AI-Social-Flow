import { User, InsertUser, ContentAnalysis, InsertContentAnalysis, users, contentAnalysis, scheduledPosts, ScheduledPost, socialAccounts, userSettings, SocialAccount, UserSettings, InsertSocialAccount, InsertUserSettings } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { contentHistory, ContentHistory, InsertContentHistory } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;

  // Social accounts
  getSocialAccounts(userId: number): Promise<SocialAccount[]>;
  addSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  removeSocialAccount(id: number): Promise<void>;

  // User settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Content analysis
  createContentAnalysis(analysis: Omit<ContentAnalysis, "id">): Promise<ContentAnalysis>;
  getContentAnalyses(userId: number): Promise<ContentAnalysis[]>;
  deleteContentAnalysis(id: number): Promise<void>;

  // Post scheduling
  createScheduledPost(post: Omit<ScheduledPost, "id">): Promise<ScheduledPost>;
  getUserScheduledPosts(userId: number): Promise<ScheduledPost[]>;
  getPendingScheduledPosts(): Promise<ScheduledPost[]>;
  updateScheduledPostStatus(id: number, status: string): Promise<ScheduledPost>;

  // Content history methods
  getContentHistory(userId: number): Promise<ContentHistory[]>;
  createContentHistory(history: InsertContentHistory): Promise<ContentHistory>;
  deleteContentHistory(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, createdAt: new Date().toISOString() })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Social accounts methods
  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    return await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));
  }

  async addSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const [result] = await db
      .insert(socialAccounts)
      .values({ ...account, createdAt: new Date().toISOString() })
      .returning();
    return result;
  }

  async removeSocialAccount(id: number): Promise<void> {
    await db
      .delete(socialAccounts)
      .where(eq(socialAccounts.id, id));
  }

  // User settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [existing] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set(settings)
        .where(eq(userSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSettings)
        .values({ userId, ...settings })
        .returning();
      return created;
    }
  }

  // Content analysis methods
  async createContentAnalysis(analysis: Omit<ContentAnalysis, "id">): Promise<ContentAnalysis> {
    const [result] = await db
      .insert(contentAnalysis)
      .values(analysis)
      .returning();
    return result;
  }

  async getContentAnalyses(userId: number): Promise<ContentAnalysis[]> {
    return await db
      .select()
      .from(contentAnalysis)
      .where(eq(contentAnalysis.userId, userId))
      .orderBy(contentAnalysis.createdAt);
  }

  async deleteContentAnalysis(id: number): Promise<void> {
    await db
      .delete(contentAnalysis)
      .where(eq(contentAnalysis.id, id));
  }

  // Scheduled posts methods
  async createScheduledPost(post: Omit<ScheduledPost, "id">): Promise<ScheduledPost> {
    const [result] = await db
      .insert(scheduledPosts)
      .values(post)
      .returning();
    return result;
  }

  async getUserScheduledPosts(userId: number): Promise<ScheduledPost[]> {
    return await db
      .select()
      .from(scheduledPosts)
      .where(eq(scheduledPosts.userId, userId))
      .orderBy(scheduledPosts.scheduledTime);
  }

  async getPendingScheduledPosts(): Promise<ScheduledPost[]> {
    return await db
      .select()
      .from(scheduledPosts)
      .where(eq(scheduledPosts.status, "pending"))
      .orderBy(scheduledPosts.scheduledTime);
  }

  async updateScheduledPostStatus(id: number, status: string): Promise<ScheduledPost> {
    const [result] = await db
      .update(scheduledPosts)
      .set({ status })
      .where(eq(scheduledPosts.id, id))
      .returning();
    return result;
  }

  // Content history implementation
  async getContentHistory(userId: number): Promise<ContentHistory[]> {
    return await db
      .select()
      .from(contentHistory)
      .where(eq(contentHistory.userId, userId))
      .orderBy(contentHistory.generatedAt);
  }

  async createContentHistory(history: InsertContentHistory): Promise<ContentHistory> {
    const [result] = await db
      .insert(contentHistory)
      .values({
        ...history,
        generatedAt: new Date().toISOString(),
      })
      .returning();
    return result;
  }

  async deleteContentHistory(id: number): Promise<void> {
    await db
      .delete(contentHistory)
      .where(eq(contentHistory.id, id));
  }
}

export const storage = new DatabaseStorage();