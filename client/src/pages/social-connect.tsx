import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Instagram,
  Youtube,
  Facebook,
  CheckCircle,
  AlertCircle,
  X,
  InstagramIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import SocialValidationCard from "@/components/social-validation-card";
import type { SocialAccount } from "@/types";

const instagramSchema = z.object({
  handle: z
    .string()
    .min(1, "Instagram handle is required")
    .regex(/^[a-zA-Z0-9_.]+$/, "Invalid Instagram handle format"),
  followersCount: z.number().min(0, "Followers count must be positive"),
  engagementRate: z
    .number()
    .min(0, "Engagement rate must be positive")
    .max(100, "Engagement rate cannot exceed 100%"),
  isPublic: z.boolean(),
});

type InstagramFormData = z.infer<typeof instagramSchema>;

export default function SocialConnectPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [showInstagramForm, setShowInstagramForm] = useState(false);

  const { data: socialAccountsData } = useQuery({
    queryKey: ["/api/social/accounts"],
    queryFn: api.getSocialAccounts,
  });

  const socialAccounts = socialAccountsData?.accounts || [];
  if (socialAccounts.length > 0) {
    console.log("socialAccounts", socialAccounts);
    localStorage.setItem(
      "userName",
      socialAccounts[0]?.handle?.replace("@", "")
    );
  }
  const hasInstagram = socialAccounts.some(
    (acc) => acc.platform === "instagram"
  );
  const hasEligibleAccount = true; // For testing, always allow to proceed

  const form = useForm<InstagramFormData>({
    resolver: zodResolver(instagramSchema),
    defaultValues: {
      handle: "",
      followersCount: Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000,
      engagementRate: +(Math.random() * (10.09 - 6.2) + 6.2).toFixed(2),
      isPublic: true,
    },
  });

  const connectSocialMutation = useMutation({
    mutationFn: api.connectSocialAccount,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success",
          description: "Instagram account connected successfully",
        });
        setShowInstagramForm(false);
        setConnectingPlatform(null);
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/social/accounts"] });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to connect account",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect account",
        variant: "destructive",
      });
      setConnectingPlatform(null);
    },
  });

  const handleConnectInstagram = () => {
    setShowInstagramForm(true);
  };

  const onInstagramSubmit = (data: InstagramFormData) => {
    setConnectingPlatform("instagram");
    connectSocialMutation.mutate({
      platform: "instagram",
      handle: `@${data.handle}`,
      followersCount: data.followersCount,
      engagementRate: data.engagementRate,
      isPublic: data.isPublic,
    });
  };

  const handleConnectYouTube = () => {
    setConnectingPlatform("youtube");
    // Simulate YouTube connection
    setTimeout(() => {
      connectSocialMutation.mutate({
        platform: "youtube",
        handle: "Demo User",
        followersCount: 1200,
        engagementRate: 7.5,
        isPublic: true,
      });
    }, 2000);
  };

  const handleProceed = () => {
    if (!hasEligibleAccount) {
      toast({
        title: "Eligibility Required",
        description:
          "Please connect at least one eligible social media account to proceed",
        variant: "destructive",
      });
      return;
    }
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connect your social media
        </h2>
        <p className="text-gray-600 mb-8">
          We'll verify your follower count and engagement rate
        </p>

        <div className="space-y-4 mb-8">
          {/* Instagram Connect */}
          <Dialog open={showInstagramForm} onOpenChange={setShowInstagramForm}>
            <SocialValidationCard
              platform="instagram"
              icon={<InstagramIcon className="w-5 h-5 text-white" />}
              name="Instagram"
              required={true}
              isConnected={hasInstagram}
              isConnecting={connectingPlatform === "instagram"}
              onConnect={handleConnectInstagram}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              account={socialAccounts.find(
                (acc) => acc.platform === "instagram"
              )}
            />

            <DialogContent className="w-[95%] max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <span>Connect Instagram Account</span>
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onInstagramSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram Handle</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              @
                            </span>
                            <Input
                              {...field}
                              placeholder="username"
                              className="pl-8"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="followersCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Followers Count</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="1000"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engagementRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engagement Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="8.5"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> For testing purposes, all accounts
                      will be accepted regardless of eligibility criteria.
                    </p>
                  </div> */}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInstagramForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={connectSocialMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {connectSocialMutation.isPending
                        ? "Connecting..."
                        : "Connect"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* YouTube Connect */}
          <SocialValidationCard
            platform="youtube"
            icon={<Youtube className="w-5 h-5 text-white" />}
            name="YouTube"
            required={false}
            isConnected={socialAccounts.some(
              (acc) => acc.platform === "youtube"
            )}
            isConnecting={connectingPlatform === "youtube"}
            onConnect={handleConnectYouTube}
            gradient="bg-red-600"
            account={socialAccounts.find((acc) => acc.platform === "youtube")}
          />
        </div>

        {/* Connected Accounts Summary */}
        {socialAccounts.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">
              Connected Accounts
            </h3>
            <div className="space-y-2">
              {socialAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        account.platform === "instagram"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-red-500"
                      }`}
                    >
                      {account.platform === "instagram" ? (
                        <Instagram className="w-4 h-4 text-white" />
                      ) : (
                        <Youtube className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {account.handle}
                      </p>
                      {/* <p className="text-sm text-gray-600">
                        {account.followersCount.toLocaleString()} followers •{" "}
                        {account.engagementRate}% engagement
                      </p> */}
                    </div>
                  </div>
                  {account.followersCount >= 500 &&
                  parseFloat(account.engagementRate) >= 6 &&
                  account.isPublic ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        <Card className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Eligibility Criteria
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Minimum 500+ followers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                6%+ engagement rate
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Public account
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Female creators preferred
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button
          onClick={handleProceed}
          disabled={!hasEligibleAccount}
          className="w-full mb-12 bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all"
        >
          {hasEligibleAccount ? "START CREATING CONTENT" : "VERIFY ELIGIBILITY"}
        </Button>
      </div>
    </div>
  );
}
