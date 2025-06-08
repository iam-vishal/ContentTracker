import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export default function OrderTrackingPage() {
  const [, setLocation] = useLocation();

  const { data: claimsData, refetch, isLoading } = useQuery({
    queryKey: ["/api/rewards/claims"],
    queryFn: api.getRewardClaims,
  });

  const claims = claimsData?.claims || [];
  const latestClaim = claims[0]; // Most recent claim

  if (!latestClaim) {
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
            <h2 className="text-xl font-bold text-gray-800">Track Your Order</h2>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't claimed any rewards yet. Submit content and get approved to claim your Glycolic Gloss pack.
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'shipped':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      case 'pending':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-white" />;
    }
    
    switch (status.toLowerCase()) {
      case 'shipped':
        return <Truck className="w-4 h-4 text-white" />;
      case 'confirmed':
        return <Package className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-white" />;
    }
  };

  const trackingSteps = [
    {
      title: "Order Confirmed",
      description: new Date(latestClaim.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: "confirmed",
      completed: true,
    },
    {
      title: "Packed",
      description: latestClaim.status === 'shipped' || latestClaim.status === 'delivered' 
        ? "Packed and ready to ship" 
        : "Packing in progress",
      status: "packed",
      completed: latestClaim.status === 'shipped' || latestClaim.status === 'delivered',
    },
    {
      title: "In Transit",
      description: latestClaim.estimatedDelivery 
        ? `Expected: ${new Date(latestClaim.estimatedDelivery).toLocaleDateString('en-IN')}`
        : "Will update soon",
      status: "shipped",
      completed: latestClaim.status === 'shipped' || latestClaim.status === 'delivered',
    },
    {
      title: "Delivered",
      description: latestClaim.actualDelivery 
        ? new Date(latestClaim.actualDelivery).toLocaleDateString('en-IN')
        : "Pending delivery",
      status: "delivered",
      completed: latestClaim.status === 'delivered',
    },
  ];

  const currentStep = trackingSteps.findIndex(step => 
    step.status === latestClaim.status.toLowerCase()
  );

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
          <h2 className="text-xl font-bold text-gray-800">Track Your Order</h2>
        </div>

        {/* Order Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Order #{latestClaim.trackingId}</h3>
              <Badge 
                className={`${
                  latestClaim.status === 'delivered' ? 'bg-green-500' :
                  latestClaim.status === 'shipped' ? 'bg-blue-500' :
                  latestClaim.status === 'confirmed' ? 'bg-yellow-500' :
                  'bg-gray-500'
                } text-white`}
              >
                {latestClaim.status === 'shipped' ? 'In Transit' : 
                 latestClaim.status.charAt(0).toUpperCase() + latestClaim.status.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-4">
              {trackingSteps.map((step, index) => (
                <div key={step.title} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    step.completed ? getStatusColor(step.status) : 'bg-gray-300'
                  }`}>
                    {getStatusIcon(step.status, step.completed)}
                  </div>
                  <div className={step.completed ? '' : 'opacity-50'}>
                    <div className="font-medium text-gray-800">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracking Details */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Tracking Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking ID:</span>
                <span className="font-medium">{latestClaim.trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carrier:</span>
                <span className="font-medium">{latestClaim.carrierName || 'Delhivery'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reward:</span>
                <span className="font-medium">Glycolic Gloss Pack (₹{latestClaim.rewardValue})</span>
              </div>
              {latestClaim.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="font-medium">
                    {new Date(latestClaim.estimatedDelivery).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Delivery Address</h4>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800">{latestClaim.deliveryAddress.name}</p>
              <p>{latestClaim.deliveryAddress.street}</p>
              <p>{latestClaim.deliveryAddress.city}, {latestClaim.deliveryAddress.pincode}</p>
              <p>{latestClaim.deliveryAddress.phoneNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? "Refreshing..." : "REFRESH STATUS"}
        </Button>
      </div>
    </div>
  );
}
