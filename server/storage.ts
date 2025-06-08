import {
  users,
  socialAccounts,
  contentSubmissions,
  rewardClaims,
  otpVerifications,
  campaignParticipation,
  type User,
  type InsertUser,
  type SocialAccount,
  type InsertSocialAccount,
  type ContentSubmission,
  type InsertContentSubmission,
  type RewardClaim,
  type InsertRewardClaim,
  type OtpVerification,
  type InsertOtpVerification,
  type CampaignParticipation,
  type InsertCampaignParticipation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // OTP operations
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getValidOtp(phoneNumber: string, otp: string): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: number): Promise<void>;

  // Social account operations
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]>;
  updateSocialAccount(id: number, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined>;

  // Content operations
  createContentSubmission(content: InsertContentSubmission): Promise<ContentSubmission>;
  getContentSubmissionsByUserId(userId: number): Promise<ContentSubmission[]>;
  updateContentSubmission(id: number, updates: Partial<InsertContentSubmission>): Promise<ContentSubmission | undefined>;

  // Reward operations
  createRewardClaim(claim: InsertRewardClaim): Promise<RewardClaim>;
  getRewardClaimsByUserId(userId: number): Promise<RewardClaim[]>;
  updateRewardClaim(id: number, updates: Partial<InsertRewardClaim>): Promise<RewardClaim | undefined>;

  // Campaign operations
  createCampaignParticipation(participation: InsertCampaignParticipation): Promise<CampaignParticipation>;
  getCampaignParticipationByUserId(userId: number): Promise<CampaignParticipation | undefined>;
  updateCampaignParticipation(id: number, updates: Partial<InsertCampaignParticipation>): Promise<CampaignParticipation | undefined>;

  // Analytics
  getTotalParticipants(): Promise<number>;
  getTotalContentSubmissions(): Promise<number>;
  getTotalRewardsClaimed(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // OTP operations
  async createOtpVerification(otpData: InsertOtpVerification): Promise<OtpVerification> {
    const [otp] = await db
      .insert(otpVerifications)
      .values(otpData)
      .returning();
    return otp;
  }

  async getValidOtp(phoneNumber: string, otp: string): Promise<OtpVerification | undefined> {
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.otp, otp),
          eq(otpVerifications.isUsed, false),
          gt(otpVerifications.expiresAt, new Date())
        )
      );
    return otpRecord;
  }

  async markOtpAsUsed(id: number): Promise<void> {
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, id));
  }

  // Social account operations
  async createSocialAccount(accountData: InsertSocialAccount): Promise<SocialAccount> {
    const [account] = await db
      .insert(socialAccounts)
      .values({
        ...accountData,
        updatedAt: new Date(),
      })
      .returning();
    return account;
  }

  async getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]> {
    return db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId))
      .orderBy(desc(socialAccounts.createdAt));
  }

  async updateSocialAccount(id: number, updates: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const [account] = await db
      .update(socialAccounts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(socialAccounts.id, id))
      .returning();
    return account;
  }

  // Content operations
  async createContentSubmission(contentData: InsertContentSubmission): Promise<ContentSubmission> {
    const [content] = await db
      .insert(contentSubmissions)
      .values({
        ...contentData,
        updatedAt: new Date(),
      })
      .returning();
    return content;
  }

  async getContentSubmissionsByUserId(userId: number): Promise<ContentSubmission[]> {
    return db
      .select()
      .from(contentSubmissions)
      .where(eq(contentSubmissions.userId, userId))
      .orderBy(desc(contentSubmissions.createdAt));
  }

  async updateContentSubmission(id: number, updates: Partial<InsertContentSubmission>): Promise<ContentSubmission | undefined> {
    const [content] = await db
      .update(contentSubmissions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(contentSubmissions.id, id))
      .returning();
    return content;
  }

  // Reward operations
  async createRewardClaim(claimData: InsertRewardClaim): Promise<RewardClaim> {
    const [claim] = await db
      .insert(rewardClaims)
      .values({
        ...claimData,
        updatedAt: new Date(),
      })
      .returning();
    return claim;
  }

  async getRewardClaimsByUserId(userId: number): Promise<RewardClaim[]> {
    return db
      .select()
      .from(rewardClaims)
      .where(eq(rewardClaims.userId, userId))
      .orderBy(desc(rewardClaims.createdAt));
  }

  async updateRewardClaim(id: number, updates: Partial<InsertRewardClaim>): Promise<RewardClaim | undefined> {
    const [claim] = await db
      .update(rewardClaims)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(rewardClaims.id, id))
      .returning();
    return claim;
  }

  // Campaign operations
  async createCampaignParticipation(participationData: InsertCampaignParticipation): Promise<CampaignParticipation> {
    const [participation] = await db
      .insert(campaignParticipation)
      .values({
        ...participationData,
        updatedAt: new Date(),
      })
      .returning();
    return participation;
  }

  async getCampaignParticipationByUserId(userId: number): Promise<CampaignParticipation | undefined> {
    const [participation] = await db
      .select()
      .from(campaignParticipation)
      .where(eq(campaignParticipation.userId, userId));
    return participation;
  }

  async updateCampaignParticipation(id: number, updates: Partial<InsertCampaignParticipation>): Promise<CampaignParticipation | undefined> {
    const [participation] = await db
      .update(campaignParticipation)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(campaignParticipation.id, id))
      .returning();
    return participation;
  }

  // Analytics
  async getTotalParticipants(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(campaignParticipation);
    return result.count;
  }

  async getTotalContentSubmissions(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(contentSubmissions);
    return result.count;
  }

  async getTotalRewardsClaimed(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(rewardClaims);
    return result.count;
  }
}

export const storage = new DatabaseStorage();
