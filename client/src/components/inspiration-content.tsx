import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  DownloadCloud,
  DownloadCloudIcon,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import React from "react";
import ReactPlayer from "react-player/lazy";
import { Separator } from "./ui/separator";

interface propsTypes {
  caption: string;
  media_url: string;
  media_type: "video" | "image";
}

function InspirationContent({ caption, media_url, media_type }: propsTypes) {
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

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
    <div>
      {media_type === "video" ? (
        <div className="w-full ">
          <ReactPlayer
            url={media_url}
            light
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ) : (
        <div className="relative">
          <div className="bg-black/40 absolute top-2 right-2 rounded-md p-2 cursor-pointer">
            {downloading ? (
              <div className="animate-spin">
                <LoaderCircle size={20} color="white" />
              </div>
            ) : (
              <Download
                size={20}
                color="white"
                onClick={() => handleDownload(media_url)}
              />
            )}
          </div>
          <img
            src={media_url}
            alt={caption}
            className="rounded-lg  object-cover"
          />
        </div>
      )}
      <div className="flex mt-2">
        <span className="flex-1">{caption}</span>
        {copied ? (
          <Check size={20} className="text-green-600" />
        ) : (
          <Copy size={20} className="cursor-pointer" onClick={handleCopy} />
        )}
      </div>
      <Separator className="mt-4" />
    </div>
  );
}

export default InspirationContent;
