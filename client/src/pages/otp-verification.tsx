import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function OtpVerificationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneNumber = sessionStorage.getItem("verificationPhone");
  const devOtp = sessionStorage.getItem("devOtp");

  useEffect(() => {
    if (!phoneNumber) {
      setLocation("/");
      return;
    }

    // Auto-fill OTP in development
    if (devOtp && process.env.NODE_ENV === "development") {
      const otpArray = devOtp.split("");
      setOtp(otpArray);
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phoneNumber, devOtp, setLocation]);

  const verifyOtpMutation = useMutation({
    mutationFn: (otpCode: string) => api.verifyOtp(phoneNumber!, otpCode),
    onSuccess: (data) => {
      console.log(data);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        sessionStorage.removeItem("verificationPhone");
        sessionStorage.removeItem("devOtp");
        toast({
          title: "Success",
          description: "Phone number verified successfully",
        });
        setLocation("/social-connect");
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => api.sendOtp(phoneNumber!),
    onSuccess: (data) => {
      if (data.success) {
        setTimer(30);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);

        if (data.otp) {
          sessionStorage.setItem("devOtp", data.otp);
        }

        toast({
          title: "OTP Sent",
          description: "New verification code sent to your phone",
        });
      }
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      verifyOtpMutation.mutate(otpCode);
    } else {
      toast({
        title: "Error",
        description: "Please enter complete 6-digit OTP",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    sessionStorage.removeItem("verificationPhone");
    sessionStorage.removeItem("devOtp");
    setLocation("/");
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <div className="h-screen bg-white">
      <div className="p-6 pt-16">
        <button onClick={handleGoBack} className="mb-6 text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Verify your number
        </h2>
        <p className="text-gray-600 mb-8">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium">{phoneNumber}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center border-2 border-gray-200 rounded-lg text-xl font-bold focus:border-primary focus:outline-none"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={verifyOtpMutation.isPending || otp.join("").length !== 6}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "VERIFY & CONTINUE"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Didn't receive code?</p>
          {canResend ? (
            <Button
              variant="link"
              onClick={() => resendOtpMutation.mutate()}
              disabled={resendOtpMutation.isPending}
              className="text-primary font-medium mt-2"
            >
              {resendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
            </Button>
          ) : (
            <p className="text-primary font-medium mt-2">Resend in {timer}s</p>
          )}
        </div>
      </div>
    </div>
  );
}
