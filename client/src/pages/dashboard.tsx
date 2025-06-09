import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Gift,
  TrendingUp,
  Users,
  Settings,
  Eye,
  LogOut,
  LoaderCircle,
  Download,
  Check,
  Copy,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Inspiration from "./inspiration";
import InspirationContent from "@/components/inspiration-content";
import { useState } from "react";

const inspirationImages = [
  {
    media_url:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
    alt: "Hair transformation before after",
  },
  {
    media_url:
      "https://plus.unsplash.com/premium_photo-1683121263622-664434494177?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
    alt: "Content creation setup for beauty videos",
  },
  {
    media_url:
      "https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhc2hpb258ZW58MHx8MHx8fDA%3D",
    alt: "Close-up of glossy healthy hair",
  },
  {
    media_url:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZhc2hpb258ZW58MHx8MHx8fDA%3D",
    alt: "Beauty influencer with hair care products",
  },
];

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
  });

  const { data: submissionsData } = useQuery({
    queryKey: ["/api/content/submissions"],
    queryFn: api.getContentSubmissions,
  });

  const { data: claimsData } = useQuery({
    queryKey: ["/api/rewards/claims"],
    queryFn: api.getRewardClaims,
  });

  const stats = statsData?.stats;
  const submissions = submissionsData?.submissions || [];
  const claims = claimsData?.claims || [];

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return localStorage.getItem("userName")?.slice(-1) || "K";
  };

  const getDisplayName = () => {
    console.log("user", user);
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.phoneNumber || "Creator";
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (url: string) => {
    setDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = url.split("/").pop() || "downloaded-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {localStorage.getItem("userName")}
              </h3>
              <p className="text-xs text-gray-600">{user?.phoneNumber}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 space-y-4">
        {/* <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {stats?.followers?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {stats?.engagement || "0"}%
              </div>
              <div className="text-sm text-gray-600">Engagement</div>
            </CardContent>
          </Card>
        </div> */}

        {/* Campaign Status */}
        <Card className="bg-gradient-to-r from-primary to-pink-500 text-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">
              Glossy Transition Campaign
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Create content showcasing hair transformation
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-75">Reward</div>
                <div className="font-semibold">3-Item Glycolic Gloss Pack</div>
              </div>
              <div className="text-xl font-bold">₹500</div>
            </div>
          </CardContent>
        </Card>

        {/* Content Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-500">
                  {stats?.contentSubmitted || 0}
                </div>
                <div className="text-xs text-gray-600">Submitted</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">
                  {stats?.contentApproved || 0}
                </div>
                <div className="text-xs text-gray-600">Approved</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-500">
                  {stats?.rewardsClaimed || 0}
                </div>
                <div className="text-xs text-gray-600">Claimed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {(submissions.length > 0 || claims.length > 0) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Recent Activity
              </h3>
              <div className="space-y-2">
                {submissions.slice(0, 3).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Content submitted
                      </span>
                    </div>
                    <Badge
                      variant={
                        submission.validationStatus === "approved"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {submission.validationStatus}
                    </Badge>
                  </div>
                ))}
                {claims.slice(0, 2).map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Reward claimed
                      </span>
                    </div>
                    <Badge variant="default">{claim.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inspiration Gallery */}
        <Card>
          <CardContent className="p-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Get Inspired
            </h3>
            <Dialog>
              <DialogTrigger asChild>
                <div className="grid grid-cols-2 gap-3 cursor-pointer">
                  {inspirationImages?.map((media, index) => (
                    <img
                      key={index}
                      src={media.media_url}
                      alt={media.alt}
                      className="rounded-lg aspect-square object-cover"
                    />
                  ))}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl px-4 rounded-lg overflow-hidden">
                <DialogHeader className="p-2 pb-0">
                  <DialogTitle>Inspiration Gallery</DialogTitle>
                </DialogHeader>
                <DialogDescription className="p-6 pt-4">
                  <Carousel className="w-full">
                    <CarouselContent className="ml-1 ">
                      {inspirationImages?.map((content, index) => (
                        <CarouselItem
                          key={index}
                          className="pl-1 flex justify-center"
                        >
                          <div className="p-2 ">
                            <div className="relative w-full h-[600px]">
                              <div className="bg-black/40 absolute top-2 right-2 rounded-md p-2 cursor-pointer">
                                {downloading ? (
                                  <div className="animate-spin">
                                    <LoaderCircle size={20} color="white" />
                                  </div>
                                ) : (
                                  <Download
                                    size={20}
                                    color="white"
                                    onClick={() =>
                                      handleDownload(content?.media_url)
                                    }
                                  />
                                )}
                              </div>
                              <img
                                src={content?.media_url}
                                alt={content?.alt}
                                className="rounded-lg h-full "
                              />
                            </div>
                            <div className="flex mt-2">
                              <span className="flex-1">{content?.alt}</span>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4">
                      <CarouselPrevious className="h-8 w-8" />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4">
                      <CarouselNext className="h-8 w-8" />
                    </div>
                  </Carousel>
                </DialogDescription>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => setLocation("/inspiration")}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Inspiration
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/content")}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>Submit Your Content</span>
          </Button>

          <Button
            onClick={() => setLocation("/rewards")}
            variant="outline"
            className="w-full border-primary text-primary py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-primary hover:text-white transition-all"
          >
            <Gift className="w-5 h-5" />
            <span>Claim Your Reward</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
