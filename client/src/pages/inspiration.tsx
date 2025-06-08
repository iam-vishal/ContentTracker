import InspirationContent from "@/components/inspiration-content";
import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { useLocation } from "wouter";

function Inspiration() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const [, setLocation] = useLocation();
  return (
    <div>
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center mr-4 cursor-pointer">
            <ArrowLeft onClick={() => setLocation("/dashboard")} />
          </div>
          <h2 className="text-xl flex-1 font-bold text-gray-800">
            Inspirational content
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-8 mb-[50px]">
        <InspirationContent
          media_type="image"
          caption="✨ Radiate confidence, glow with grace. Because with L’Oréal, beauty begins with care. #LOrealParis #BecauseYoureWorthIt"
          media_url="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D"
        />
        <InspirationContent
          media_type="image"
          caption="💋 Bold lips. Strong spirit. Powered by L’Oréal, perfected by you. #LOrealBeauty #MakeupGoals"
          media_url="https://plus.unsplash.com/premium_photo-1683121263622-664434494177?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D"
        />
        <InspirationContent
          media_type="image"
          caption="🌿 Skincare that speaks for itself. Smooth. Hydrated. Luminous — just the L’Oréal way. #GlowWithLOreal"
          media_url="https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhc2hpb258ZW58MHx8MHx8fDA%3D"
        />
        <InspirationContent
          media_type="image"
          caption="💁‍♀️ Good hair days start here. Thanks to L’Oréal, my shine never takes a day off. #HairGoals #LOrealHair"
          media_url="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZhc2hpb258ZW58MHx8MHx8fDA%3D"
        />
      </div>
    </div>
  );
}

export default Inspiration;
