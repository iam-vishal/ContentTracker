export interface User {
  id: number;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isVerified: boolean;
}

export interface SocialAccount {
  id: number;
  userId: number;
  platform: string;
  handle: string;
  displayName?: string;
  profileUrl?: string;
  followersCount: number;
  engagementRate: string;
  isPublic: boolean;
  isVerified: boolean;
  verificationData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSubmission {
  id: number;
  userId: number;
  socialAccountId?: number;
  contentUrl: string;
  platform: string;
  contentType?: string;
  title?: string;
  description?: string;
  hashtags: string[];
  isApproved: boolean;
  approvalNotes?: string;
  validationStatus: string;
  contentData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface RewardClaim {
  id: number;
  userId: number;
  contentSubmissionId?: number;
  rewardType: string;
  rewardValue: string;
  deliveryAddress: DeliveryAddress;
  status: string;
  trackingId?: string;
  carrierName?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddress {
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  pincode: string;
  state?: string;
}

export interface CampaignStats {
  followers: number;
  engagement: string;
  contentSubmitted: number;
  contentApproved: number;
  rewardsClaimed: number;
  campaignStatus: string;
}

export interface CampaignAnalytics {
  totalParticipants: number;
  totalContentSubmissions: number;
  totalRewardsClaimed: number;
  targetParticipants: number;
  targetContent: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  account?: SocialAccount;
  submission?: ContentSubmission;
  claim?: RewardClaim;
  accounts?: SocialAccount[];
  submissions?: ContentSubmission[];
  claims?: RewardClaim[];
  stats?: CampaignStats;
  analytics?: CampaignAnalytics;
  otp?: string; // For development only
}
