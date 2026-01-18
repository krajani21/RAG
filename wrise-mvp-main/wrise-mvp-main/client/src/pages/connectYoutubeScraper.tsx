import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { access } from "fs";
import { supabase } from "@/lib/supabaseClient";

// Backend endpoint
const YT_SCRAPE_URL = "https://clonark.onrender.com/api/youtube/scrape";

interface Video {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  publishedAt?: string;
  comments?: string[];
  transcript?: string;
}

const ConnectYoutubeScraper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [channelName, setChannelName] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [fullChannelUrl, setFullChannelUrl] = useState("");
  
  // Clean up interval on unmount
useEffect(() => {
    const fetchSavedVideos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) return;

    const res = await fetch("https://clonark.onrender.com/api/youtube/videos", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await res.json();
    if (res.ok && Array.isArray(data.items)) {
      setVideos(data.items);
      setConnected(true);
      setChannelName(data.channelName || "");
    }
  };
  fetchSavedVideos();
}, []);

const handleAnalyze = async () => {
  if (!connected && channelName.trim() === "") return;

  setProgress(0);
  setLoading(true);
  setCurrentStep(1);

  intervalRef.current = setInterval(() => {
    setProgress((prev) => (prev >= 95 ? 95 : prev + 2));
  }, 100);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      alert("You must be logged in.");
      return;
    }

    const urlToUse = connected
      ? fullChannelUrl
      : channelName.trim().startsWith("http")
        ? channelName.trim()
        : `https://www.youtube.com/@${channelName.trim()}`;

    const res = await fetch(YT_SCRAPE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        channel: urlToUse,
        accessToken
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[YT scrape] backend error:", data);
      alert(`Failed: ${data?.error || "unknown error"}`);
      return;
    }

    setVideos(data.items || []);
    setConnected(true);
    setCurrentStep(2);

    if (!connected) {
      setFullChannelUrl(urlToUse); // Save full URL on first connect
    }

  } catch (err) {
    console.error(err);
    alert("Network error.");
  } finally {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    setTimeout(() => setLoading(false), 400);
  }
};

  return (
    <>
      {/* Modal overlay shown while loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4 animate-fadeIn">
            <p className="text-center font-medium">Analyzing Your Channel it take few minute to connect…</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-20 space-y-12">
        {/* Back Link */}
        <div className="max-w-3xl mx-auto">
          <Link
            to="/connect"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-wrise-primary transition"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Enter Your YouTube Channel Name</h1>
          <p className="text-gray-600">
            Provide your channel name so Wrise can analyze your videos, pull transcripts, and engage your audience in one place.
          </p>
        </div>

        {/* Channel Input & Button */}
        <div className="max-w-lg mx-auto bg-white border rounded-2xl shadow-md p-6 space-y-4">
          <input
            type="text"
            placeholder="e.g. MyAwesomeChannel"
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:border-red-500"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={!connected && !channelName.trim()}
            >
              {connected ? "Connected" : "Next"}
            </Button>
            {connected && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setConnected(false);
                  setVideos([]);
                  setChannelName("");

                }}
              >
                Disconnect
              </Button>
            )}
        </div>
      </div>

        {/* Videos Preview */}
        {videos.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-4 mt-10">
            <h2 className="text-xl font-semibold">Latest Videos</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {videos.map((video, i) => (
                <div key={i} className="border bg-white rounded-xl p-3 shadow hover:shadow-md transition">
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                    {/* Thumbnail */}
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">No thumbnail</div>
                    )}
                  </a>
                  <p className="font-semibold line-clamp-2 mb-1">{video.title || "Untitled"}</p>
                  {video.publishedAt && (
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {/* Comments */}
                  {Array.isArray(video.comments) && video.comments.length > 0 ? (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Top Comments:</p>
                        <ul className="text-xs text-gray-600 space-y-1 max-h-24 overflow-y-auto">
                          {video.comments.map((comment, index) => (
                            <li key={index}>• {comment}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No comments found.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConnectYoutubeScraper;