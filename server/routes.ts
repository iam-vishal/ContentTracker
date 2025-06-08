import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertOtpVerificationSchema, insertSocialAccountSchema, insertContentSubmissionSchema, insertRewardClaimSchema } from "@shared/schema";

// Request validation schemas
const sendOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[0-9]{10}$/, "Invalid Indian phone number format"),
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[0-9]{10}$/, "Invalid Indian phone number format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const contentUrlSchema = z.object({
  url: z.string().url("Invalid URL format"),
  hashtags: z.array(z.string()).optional(),
});

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().regex(/^\+91[0-9]{10}$/, "Invalid phone number"),
  street: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid PIN code"),
  state: z.string().optional(),
});

// Helper function to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to validate social media URL and extract data
async function validateSocialMediaUrl(url: string): Promise<{
  platform: string;
  handle: string;
  isValid: boolean;
  data?: any;
}> {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('instagram.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const handle = pathParts[0] === 'p' || pathParts[0] === 'reel' ? pathParts[1] : pathParts[0];
      return {
        platform: 'instagram',
        handle: handle || '',
        isValid: !!handle,
        data: { originalUrl: url }
      };
    } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return {
        platform: 'youtube',
        handle: '',
        isValid: true,
        data: { originalUrl: url }
      };
    } else if (hostname.includes('facebook.com')) {
      return {
        platform: 'facebook',
        handle: '',
        isValid: true,
        data: { originalUrl: url }
      };
    }

    return { platform: 'unknown', handle: '', isValid: false };
  } catch {
    return { platform: 'unknown', handle: '', isValid: false };
  }
}

// Helper function to validate required hashtags
function validateHashtags(hashtags: string[]): boolean {
  const requiredHashtags = ['#GlossyTransition', '#LorealIndia', '#GlycolicGloss'];
  return requiredHashtags.every(required => 
    hashtags.some(tag => tag.toLowerCase() === required.toLowerCase())
  );
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = sendOtpSchema.parse(req.body);
      
      // Generate OTP - use fixed OTP for test number
      const otp = phoneNumber === "+913333333331" ? "123456" : generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Store OTP in database
      await storage.createOtpVerification({
        phoneNumber,
        otp,
        expiresAt,
      });
      
      // In production, integrate with SMS gateway (MSG91/Textlocal)
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully",
        // For development only - remove in production
        ...(process.env.NODE_ENV === "development" && { otp })
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? error.errors[0].message : "Failed to send OTP" 
      });
    }
  });

  // Verify OTP and login/register user
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otp } = verifyOtpSchema.parse(req.body);
      
      // Verify OTP
      const otpRecord = await storage.getValidOtp(phoneNumber, otp);
      if (!otpRecord) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid or expired OTP" 
        });
      }
      
      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);
      
      // Find or create user
      let user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        user = await storage.createUser({
          phoneNumber,
          isVerified: true,
        });
        
        // Create campaign participation record
        await storage.createCampaignParticipation({
          userId: user.id,
          campaignName: "glossy_transition",
        });
      } else {
        // Update verification status
        await storage.updateUser(user.id, { isVerified: true });
      }
      
      // Set session
      (req as any).session.userId = user.id;
      
      res.json({ 
        success: true, 
        message: "OTP verified successfully",
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
        }
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? error.errors[0].message : "Failed to verify OTP" 
      });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ success: false, message: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ success: false, message: "Failed to logout" });
        }
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Failed to logout" });
    }
  });

  // Connect social media account
  app.post("/api/social/connect", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const { platform, handle, followersCount, engagementRate, isPublic } = req.body;
      
      // For testing purposes, bypass eligibility validation
      // In production, uncomment the validation below:
      /*
      if (followersCount < 500) {
        return res.status(400).json({ 
          success: false, 
          message: "Minimum 500 followers required" 
        });
      }
      
      if (engagementRate < 6) {
        return res.status(400).json({ 
          success: false, 
          message: "Minimum 6% engagement rate required" 
        });
      }
      
      if (!isPublic) {
        return res.status(400).json({ 
          success: false, 
          message: "Account must be public" 
        });
      }
      */
      
      // Create social account record
      const account = await storage.createSocialAccount({
        userId,
        platform,
        handle,
        followersCount,
        engagementRate: engagementRate.toString(),
        isPublic,
        isVerified: true,
        verificationData: { 
          verifiedAt: new Date(),
          eligibilityMet: true 
        },
      });
      
      res.json({ 
        success: true, 
        message: "Social account connected successfully",
        account
      });
    } catch (error) {
      console.error("Connect social account error:", error);
      res.status(500).json({ success: false, message: "Failed to connect social account" });
    }
  });

  // Get user's social accounts
  app.get("/api/social/accounts", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const accounts = await storage.getSocialAccountsByUserId(userId);
      res.json({ success: true, accounts });
    } catch (error) {
      console.error("Get social accounts error:", error);
      res.status(500).json({ success: false, message: "Failed to get social accounts" });
    }
  });

  // Submit content for approval
  app.post("/api/content/submit", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const { url, hashtags = [] } = contentUrlSchema.parse(req.body);
      
      // Validate social media URL
      const urlValidation = await validateSocialMediaUrl(url);
      if (!urlValidation.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid social media URL" 
        });
      }
      
      // Validate required hashtags
      if (!validateHashtags(hashtags)) {
        return res.status(400).json({ 
          success: false, 
          message: "Content must include required hashtags: #GlossyTransition, #LorealIndia, #GlycolicGloss" 
        });
      }
      
      // Create content submission - auto-approve for testing
      const submission = await storage.createContentSubmission({
        userId,
        contentUrl: url,
        platform: urlValidation.platform,
        hashtags,
        validationStatus: "approved",
        isApproved: true,
        contentData: urlValidation.data,
      });
      
      res.json({ 
        success: true, 
        message: "Content submitted and approved successfully",
        submission
      });
    } catch (error) {
      console.error("Submit content error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? error.errors[0].message : "Failed to submit content" 
      });
    }
  });

  // Get user's content submissions
  app.get("/api/content/submissions", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const submissions = await storage.getContentSubmissionsByUserId(userId);
      res.json({ success: true, submissions });
    } catch (error) {
      console.error("Get content submissions error:", error);
      res.status(500).json({ success: false, message: "Failed to get content submissions" });
    }
  });

  // Claim reward
  app.post("/api/rewards/claim", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const { address, contentSubmissionId } = req.body;
      
      // Validate address
      const validatedAddress = addressSchema.parse(address);
      
      // Check if user has approved content
      const submissions = await storage.getContentSubmissionsByUserId(userId);
      const approvedSubmission = submissions.find(s => s.isApproved && s.validationStatus === "approved");
      
      if (!approvedSubmission) {
        return res.status(400).json({ 
          success: false, 
          message: "No approved content found. Please submit and get content approved first." 
        });
      }
      
      // Create reward claim
      const claim = await storage.createRewardClaim({
        userId,
        contentSubmissionId: contentSubmissionId || approvedSubmission.id,
        rewardType: "glycolic_gloss_pack",
        rewardValue: "500.00",
        deliveryAddress: validatedAddress,
        status: "confirmed",
        trackingId: `GG${Date.now()}${Math.floor(Math.random() * 1000)}`,
        carrierName: "Delhivery",
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      res.json({ 
        success: true, 
        message: "Reward claimed successfully",
        claim
      });
    } catch (error) {
      console.error("Claim reward error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof z.ZodError ? error.errors[0].message : "Failed to claim reward" 
      });
    }
  });

  // Get user's reward claims
  app.get("/api/rewards/claims", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const claims = await storage.getRewardClaimsByUserId(userId);
      res.json({ success: true, claims });
    } catch (error) {
      console.error("Get reward claims error:", error);
      res.status(500).json({ success: false, message: "Failed to get reward claims" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const [socialAccounts, submissions, claims, participation] = await Promise.all([
        storage.getSocialAccountsByUserId(userId),
        storage.getContentSubmissionsByUserId(userId),
        storage.getRewardClaimsByUserId(userId),
        storage.getCampaignParticipationByUserId(userId),
      ]);
      
      const primaryAccount = socialAccounts.find(acc => acc.platform === 'instagram') || socialAccounts[0];
      
      res.json({ 
        success: true, 
        stats: {
          followers: primaryAccount?.followersCount || 0,
          engagement: primaryAccount?.engagementRate || "0",
          contentSubmitted: submissions.length,
          contentApproved: submissions.filter(s => s.isApproved).length,
          rewardsClaimed: claims.length,
          campaignStatus: participation?.status || "active",
        }
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ success: false, message: "Failed to get dashboard stats" });
    }
  });

  // Get campaign analytics (public)
  app.get("/api/campaign/analytics", async (req, res) => {
    try {
      const [totalParticipants, totalContent, totalRewards] = await Promise.all([
        storage.getTotalParticipants(),
        storage.getTotalContentSubmissions(),
        storage.getTotalRewardsClaimed(),
      ]);
      
      res.json({ 
        success: true, 
        analytics: {
          totalParticipants,
          totalContentSubmissions: totalContent,
          totalRewardsClaimed: totalRewards,
          targetParticipants: 500000,
          targetContent: 100000,
        }
      });
    } catch (error) {
      console.error("Get campaign analytics error:", error);
      res.status(500).json({ success: false, message: "Failed to get campaign analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
