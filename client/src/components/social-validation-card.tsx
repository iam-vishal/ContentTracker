import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  InstagramIcon,
  LucideInstagram,
} from "lucide-react";
import type { SocialAccount } from "@/types";

interface SocialValidationCardProps {
  platform: string;
  icon: React.ReactNode;
  name: string;
  required: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  gradient: string;
  account?: SocialAccount;
}

export default function SocialValidationCard({
  platform,
  icon,
  name,
  required,
  isConnected,
  isConnecting,
  onConnect,
  gradient,
  account,
}: SocialValidationCardProps) {
  const isEligible =
    account &&
    account.followersCount >= 500 &&
    parseFloat(account.engagementRate) >= 6 &&
    account.isPublic;

  return (
    <div
      className={`border-2 rounded-xl p-4 transition-all ${
        isConnected
          ? "border-green-300 bg-green-50"
          : "border-gray-200 hover:border-primary"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 ${gradient} rounded-lg flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800">{name}</h3>
              {required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            {isConnected && account ? (
              <div className="text-sm text-gray-600">
                <p className="font-medium">{account.handle}</p>
                <p>
                  {account.followersCount.toLocaleString()} followers •{" "}
                  {account.engagementRate}% engagement
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {required ? "Required" : "Optional"}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {isConnected ? (
            <div className="flex items-center space-x-2">
              {isEligible ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-300"
              >
                Connected
              </Badge>
            </div>
          ) : (
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className={`text-sm font-medium ${
                isConnecting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
              size="sm"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}

          {isConnected && !isEligible && (
            <p className="text-xs text-red-600 text-right">
              Doesn't meet eligibility criteria
            </p>
          )}
        </div>
      </div>

      {isConnected && account && !isEligible && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium mb-1">
            Eligibility Requirements Not Met:
          </p>
          <ul className="text-xs text-red-600 space-y-1">
            {account.followersCount < 500 && (
              <li>
                • Need {500 - account.followersCount} more followers (minimum
                500)
              </li>
            )}
            {parseFloat(account.engagementRate) < 6 && (
              <li>
                • Engagement rate below 6% (current: {account.engagementRate}%)
              </li>
            )}
            {!account.isPublic && <li>• Account must be public</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
