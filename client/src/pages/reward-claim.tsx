import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, CheckCircle, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { DeliveryAddress } from "@/types";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  street: z.string().min(5, "Please enter complete address"),
  city: z.string().min(1, "City is required"),
  pincode: z
    .string()
    .length(6, "PIN code must be 6 digits")
    .regex(/^[0-9]+$/, "PIN code must contain only digits"),
  state: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function RewardClaimPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      street: "",
      city: "",
      pincode: "",
      state: "",
    },
  });

  const { data: submissionsData } = useQuery({
    queryKey: ["/api/content/submissions"],
    queryFn: api.getContentSubmissions,
  });

  const { data: claimsData } = useQuery({
    queryKey: ["/api/rewards/claims"],
    queryFn: api.getRewardClaims,
  });

  const submissions = submissionsData?.submissions || [];
  const claims = claimsData?.claims || [];
  const approvedSubmission = submissions.find(
    (s) => s.isApproved && s.validationStatus === "approved"
  );
  const hasExistingClaim = claims.length > 0;

  const claimRewardMutation = useMutation({
    mutationFn: (data: { address: DeliveryAddress }) => api.claimReward(data),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success! 🎉",
          description:
            "Your reward has been claimed successfully. You'll receive tracking details soon.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/rewards/claims"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        setLocation("/tracking");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to claim reward",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  const validatePincode = async (pincode: string) => {
    if (pincode.length === 6) {
      // Simulate PIN code validation
      setTimeout(() => {
        // Most Indian PIN codes are serviceable
        setPincodeValid(true);
      }, 500);
    } else {
      setPincodeValid(null);
    }
  };

  const onSubmit = (data: AddressFormData) => {
    if (!approvedSubmission) {
      toast({
        title: "No Approved Content",
        description:
          "Please submit and get your content approved first to claim rewards",
        variant: "destructive",
      });
      return;
    }

    const address: DeliveryAddress = {
      name: data.name,
      phoneNumber: `+91${data.phoneNumber}`,
      street: data.street,
      city: data.city,
      pincode: data.pincode,
      state: data.state,
    };

    claimRewardMutation.mutate({ address });
  };

  const watchedPincode = form.watch("pincode");

  useEffect(() => {
    if (watchedPincode) {
      validatePincode(watchedPincode);
    }
  }, [watchedPincode]);

  if (hasExistingClaim) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="p-4 pt-16">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setLocation("/dashboard")}
              className="mr-4 text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Your Rewards</h2>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Reward Already Claimed!
              </h3>
              <p className="text-gray-600 mb-4">
                You've already claimed your Glycolic Gloss pack. Check the
                tracking page for delivery updates.
              </p>
              <Button
                onClick={() => setLocation("/tracking")}
                className="bg-green-500 hover:bg-green-600"
              >
                Track Your Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!approvedSubmission) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="p-4 pt-4">
          <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center mr-4 cursor-pointer">
                <ArrowLeft onClick={() => setLocation("/dashboard")} />
              </div>
              <h2 className="text-xl flex-1 font-bold text-gray-800">
                Claim Your Reward
              </h2>
            </div>
          </div>
          {/* <div className="flex items-center mb-6">
            <button
              onClick={() => setLocation("/dashboard")}
              className="mr-4 text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              Claim Your Reward
            </h2>
          </div> */}

          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Content Approval Required
              </h3>
              <p className="text-gray-600 mb-4">
                You need to submit and get your content approved before claiming
                rewards.
              </p>
              <Button
                onClick={() => setLocation("/content")}
                className="bg-primary hover:bg-primary/90"
              >
                Submit Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 pt-16">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setLocation("/dashboard")}
            className="mr-4 text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Claim Your Reward</h2>
        </div>

        {/* Reward Details */}
        <Card className="bg-gradient-to-r from-primary to-pink-500 text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Package className="w-8 h-8 mr-3" />
              <h3 className="text-xl font-semibold">Congratulations! 🎉</h3>
            </div>
            <p className="opacity-90 mb-4">Your content has been approved</p>

            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    3-Item Glycolic Gloss Pack
                  </div>
                  <div className="text-sm opacity-75">Free home delivery</div>
                </div>
                <div className="text-2xl font-bold">₹500</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-4">
              Delivery Address
            </h4>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        +91
                      </div>
                      <Input
                        {...field}
                        placeholder="Phone Number"
                        className="pl-12 py-4 border-2 border-gray-200 rounded-xl focus:border-primary"
                        maxLength={10}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complete Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="House/Flat No., Building, Street, Area"
                      className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="City"
                        className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="PIN Code"
                        className="p-4 border-2 border-gray-200 rounded-xl focus:border-primary"
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PIN Code Verification */}
            {pincodeValid && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Delivery available in your area
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              disabled={claimRewardMutation.isPending || !pincodeValid}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all mt-6"
            >
              {claimRewardMutation.isPending
                ? "Processing..."
                : "CONFIRM CLAIM"}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Products will be delivered within 7-10 business days
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
