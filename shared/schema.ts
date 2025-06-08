import { pgTable, text, varchar, timestamp, jsonb, index, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social media accounts
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // instagram, youtube, facebook, twitter
  handle: varchar("handle", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  profileUrl: text("profile_url"),
  followersCount: integer("followers_count").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default("0"),
  isPublic: boolean("is_public").default(false),
  isVerified: boolean("is_verified").default(false),
  verificationData: jsonb("verification_data"), // Store API response data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content submissions
export const contentSubmissions = pgTable("content_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  contentUrl: text("content_url").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  contentType: varchar("content_type", { length: 50 }), // post, reel, video
  title: text("title"),
  description: text("description"),
  hashtags: text("hashtags").array(),
  isApproved: boolean("is_approved").default(false),
  approvalNotes: text("approval_notes"),
  validationStatus: varchar("validation_status", { length: 50 }).default("pending"), // pending, approved, rejected
  contentData: jsonb("content_data"), // Store fetched content metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reward claims
export const rewardClaims = pgTable("reward_claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  contentSubmissionId: integer("content_submission_id").references(() => contentSubmissions.id),
  rewardType: varchar("reward_type", { length: 50 }).default("glycolic_gloss_pack"),
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).default("500.00"),
  deliveryAddress: jsonb("delivery_address").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, shipped, delivered
  trackingId: varchar("tracking_id", { length: 100 }),
  carrierName: varchar("carrier_name", { length: 100 }),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP verifications
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign participation tracking
export const campaignParticipation = pgTable("campaign_participation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignName: varchar("campaign_name", { length: 100 }).default("glossy_transition"),
  participationDate: timestamp("participation_date").defaultNow(),
  status: varchar("status", { length: 50 }).default("active"), // active, completed, suspended
  contentCount: integer("content_count").default(0),
  rewardsClaimed: integer("rewards_claimed").default(0),
  totalEngagement: integer("total_engagement").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentSubmissionSchema = createInsertSchema(contentSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardClaimSchema = createInsertSchema(rewardClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignParticipationSchema = createInsertSchema(campaignParticipation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;

export type ContentSubmission = typeof contentSubmissions.$inferSelect;
export type InsertContentSubmission = z.infer<typeof insertContentSubmissionSchema>;

export type RewardClaim = typeof rewardClaims.$inferSelect;
export type InsertRewardClaim = z.infer<typeof insertRewardClaimSchema>;

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;

export type CampaignParticipation = typeof campaignParticipation.$inferSelect;
export type InsertCampaignParticipation = z.infer<typeof insertCampaignParticipationSchema>;
