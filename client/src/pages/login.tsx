import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ALIA from "../../../attached_assets/alia.jpg";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (phoneNumber: string) => api.sendOtp(`+91${phoneNumber}`),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });

        // Store phone number for verification page
        sessionStorage.setItem(
          "verificationPhone",
          `+91${form.getValues("phoneNumber")}`
        );

        // Store OTP for development
        if (data.otp) {
          sessionStorage.setItem("devOtp", data.otp);
        }

        setLocation("/verify-otp");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PhoneFormData) => {
    sendOtpMutation.mutate(data.phoneNumber);
  };

  return (
    <div className="h-screen gradient-bg relative">
      {/* Header with L'Oréal Branding */}
      <div className="pt-12 pb-8 text-center">
        <div className="text-black font-bold text-2xl mb-2">L'ORÉAL</div>
        <div className="text-black text-xs tracking-wider">PARIS</div>
      </div>

      {/* Hero Content */}
      <div className="px-6 mb-2">
        <h1 className="text-4xl font-bold text-black mb-4 leading-tight text-center">
          GLYCOLIC GLOSS
        </h1>
        <p className="text-black/90 text-lg mb-6 text-center">
          Transform your hair from dull to glossy shine
        </p>

        {/* Celebrity Endorsement */}
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-xl">
          <img
            src={ALIA}
            alt="Hair transformation showcase"
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-4 left-4">
            <div className="glass-effect rounded-lg px-3 py-2 ">
              <span className="text-white text-sm font-semibold">
                With Alia Bhatt
              </span>
            </div>
          </div>
        </div>

        {/* Product Showcase */}
        {/* <div className="relative mb-8">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200"
            alt="L'Oréal Glycolic Gloss product range"
            className="w-full h-32 object-cover rounded-xl"
          />
        </div> */}
      </div>

      {/* Login Form */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Enter your mobile number & get started!
        </h2>
        <p className="text-gray-600 mb-6">
          Join 5+ lakh creators in the Glossy Transition campaign
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <span className="text-gray-500 mr-2">🇮🇳 +91</span>
                      </div>
                      <Input
                        {...field}
                        placeholder="Mobile Number"
                        className="pl-20 pr-4 py-4 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-500 border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                        maxLength={10}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {process.env.NODE_ENV === "development" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("phoneNumber", "3333333332")}
                className="w-full text-sm text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Use Test Number: 3333333332
              </Button>
            )}

            <Button
              type="submit"
              disabled={sendOtpMutation.isPending}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 active:scale-98 transition-all shadow-lg"
            >
              {sendOtpMutation.isPending ? "Sending..." : "CONTINUE"}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
