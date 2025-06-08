import { apiRequest } from "./queryClient";
import type { ApiResponse, DeliveryAddress } from "@/types";

export const api = {
  // Authentication
  sendOtp: async (phoneNumber: string): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/auth/send-otp", { phoneNumber });
    return response.json();
  },

  verifyOtp: async (phoneNumber: string, otp: string): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/auth/verify-otp", { phoneNumber, otp });
    return response.json();
  },

  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/auth/user");
    return response.json();
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },

  // Social Media
  connectSocialAccount: async (data: {
    platform: string;
    handle: string;
    followersCount: number;
    engagementRate: number;
    isPublic: boolean;
  }): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/social/connect", data);
    return response.json();
  },

  getSocialAccounts: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/social/accounts");
    return response.json();
  },

  // Content
  submitContent: async (data: {
    url: string;
    hashtags: string[];
  }): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/content/submit", data);
    return response.json();
  },

  getContentSubmissions: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/content/submissions");
    return response.json();
  },

  // Rewards
  claimReward: async (data: {
    address: DeliveryAddress;
    contentSubmissionId?: number;
  }): Promise<ApiResponse> => {
    const response = await apiRequest("POST", "/api/rewards/claim", data);
    return response.json();
  },

  getRewardClaims: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/rewards/claims");
    return response.json();
  },

  // Dashboard
  getDashboardStats: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/dashboard/stats");
    return response.json();
  },

  getCampaignAnalytics: async (): Promise<ApiResponse> => {
    const response = await apiRequest("GET", "/api/campaign/analytics");
    return response.json();
  },
};
