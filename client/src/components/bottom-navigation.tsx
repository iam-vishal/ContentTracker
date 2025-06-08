import { useLocation } from "wouter";
import { Home, Lightbulb, PlusCircle, Gift, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/inspiration", icon: Lightbulb, label: "Inspire" },
    { path: "/content", icon: PlusCircle, label: "Submit" },
    { path: "/rewards", icon: Gift, label: "Rewards" },
    { path: "/social-connect", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (
      path === "/dashboard" &&
      (location === "/" || location === "/dashboard")
    ) {
      return true;
    }
    return location === path;
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => setLocation(path)}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${
              isActive(path)
                ? "text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
