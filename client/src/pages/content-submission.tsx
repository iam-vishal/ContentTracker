import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { InstagramEmbed, YouTubeEmbed } from "react-social-media-embed";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const contentSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type ContentFormData = z.infer<typeof contentSchema>;

export default function ContentSubmissionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewData, setPreviewData] = useState<any>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      url: "",
    },
  });

  const submitContentMutation = useMutation({
    mutationFn: (data: { url: string; hashtags: string[] }) =>
      api.submitContent(data),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success! 🎉",
          description:
            data.message || "Content submitted and approved successfully",
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/content/submissions"],
        });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit content",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit content",
        variant: "destructive",
      });
    },
  });

  const validateUrl = (url: string) => {
    setUrlError(null);
    setPreviewData(null);

    if (!url) return;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      setUrl(urlObj?.href);
      console.log("hostname: ", urlObj?.href);

      if (hostname.includes("instagram.com")) {
        setPreviewData({
          platform: "Instagram",
          type: url.includes("/reel/") ? "Reel" : "Post",
          valid: true,
        });
      } else if (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be")
      ) {
        setPreviewData({
          platform: "YouTube",
          type: "Video",
          valid: true,
        });
      } else if (hostname.includes("facebook.com")) {
        setPreviewData({
          platform: "Facebook",
          type: "Post",
          valid: true,
        });
      } else {
        setUrlError("Please enter a valid Instagram, YouTube, or Facebook URL");
      }
    } catch {
      setUrlError("Please enter a valid URL");
    }
  };

  const onSubmit = (data: ContentFormData) => {
    if (urlError || !previewData?.valid) {
      toast({
        title: "Error",
        description: "Please enter a valid social media URL",
        variant: "destructive",
      });
      return;
    }

    // Extract hashtags from the URL or description
    // In a real implementation, this would be done server-side
    const requiredHashtags = [
      "#GlossyTransition",
      "#LorealIndia",
      "#GlycolicGloss",
    ];

    submitContentMutation.mutate({
      url: data.url,
      hashtags: requiredHashtags,
    });
  };

  // const watchedUrl = form.watch("url");

  // Validate URL on change
  // useEffect(() => {
  //   if (watchedUrl) {
  //     const debounceTimer = setTimeout(() => {
  //       validateUrl(watchedUrl);
  //     }, 500);
  //     return () => clearTimeout(debounceTimer);
  //   }
  // }, [watchedUrl]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 pt-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setLocation("/dashboard")}
            className="mr-4 text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            Submit Your Content
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Content URL Input */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Content URL
                  </FormLabel>
                  <FormControl>
                    {/* <Input
                      {...field}
                      placeholder="Paste your Instagram/YouTube content URL here"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary"
                    /> */}
                    <div className="flex w-full  items-center gap-2">
                      <Input
                        {...field}
                        type="text"
                        placeholder="Paste your Instagram/YouTube content URL here"
                        className="flex flex-1"
                      />
                      <Button
                        type="button"
                        variant="default"
                        disabled={!field?.value}
                        onClick={() => validateUrl(field.value)}
                      >
                        Validate
                      </Button>
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Supported: Instagram posts/reels, YouTube videos, Facebook
                    posts
                  </p>
                  <FormMessage />
                  {urlError && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {urlError}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Content Preview */}
            {previewData && previewData.valid && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Content Preview
                  </h4>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{previewData.platform}</Badge>
                      <Badge variant="outline">{previewData.type}</Badge>
                    </div>
                    <div className=" bg-gray-200 p-0 rounded-lg flex items-center justify-center">
                      {/* <ExternalLink className="w-8 h-8 text-gray-400" /> */}
                      {previewData.platform == "Instagram" ? (
                        <div className="flex justify-center overflow-hidden">
                          <InstagramEmbed
                            className="mt-[-60px]"
                            url={url}
                            width={"100%"}
                            captioned
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center overflow-hidden">
                          <YouTubeEmbed url={url} width={"100%"} />
                        </div>
                      )}
                    </div>
                    {/* <p className="text-sm text-gray-600">
                      Content preview will load here
                    </p> */}
                    <div className="flex items-center mt-2 text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Valid URL detected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hashtag Requirements */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Required Hashtags
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-primary text-white">
                    #GlossyTransition
                  </Badge>
                  <Badge className="bg-primary text-white">#LorealIndia</Badge>
                  <Badge className="bg-primary text-white">
                    #GlycolicGloss
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Make sure your content includes these hashtags for approval
                </p>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Content Guidelines
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    Show clear before/after hair transformation
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    Feature L'Oréal Glycolic Gloss products
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    Include required hashtags and ASCI disclosure
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    Minimum 720p quality for videos
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    Original content only (no reposts)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={submitContentMutation.isPending || !previewData?.valid}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all"
            >
              {submitContentMutation.isPending ? "Submitting..." : "SUBMIT"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
