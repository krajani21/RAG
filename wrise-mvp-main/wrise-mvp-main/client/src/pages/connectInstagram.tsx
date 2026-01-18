import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const IG_SCRAPE_URL  = "https://clonark.onrender.com/api/instagram/scrape-reels";
interface Reel {
  videoUrl: string;
  latestComments?: {
    ownerUsername: string;
    text: string;
  }[];
}

const ConnectInstagram = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [connected, setConnected] = useState({
    instagram: false,
  });

  // Clean up any running interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleScrape = async () => {
    if (!user?.accessToken) {
      alert("Please log in first.");
      return;
    }
    if (!username.trim()) {
      alert("Enter a public Instagram username.");
      return;
    }

    // Reset & start the progress bar
    setProgress(0);
    setLoading(true);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // cap progress at 95% until the request completes
        if (prev >= 95) return 95;
        return prev + 2;
      });
    }, 100);

    try {
      const res = await fetch(IG_SCRAPE_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,  // Pass the token here
        },
        body: JSON.stringify({ username: username.trim().toLowerCase() }),
      });


      const data = await res.json();

      if (!res.ok) {
        console.error("[IG scrape] backend error:", data);
        alert(`Failed: ${data?.error || "unknown error"}`);
        return;
      }

      const fetched: Reel[] = data.reels?.length ? data.reels : data.posts || [];
      setReels(fetched);
      setConnected((prev) => ({ ...prev, instagram: true }));
    } catch (err) {
      alert("Network error.");
    } finally {
      // Complete the progress bar, clean up interval, and hide modal
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
            <p className="text-center font-medium">Analyzing your videos and comments......</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-20 space-y-12">
        {/* Back Button */}
        <div className="max-w-3xl mx-auto">
          <Link
            to="/connect"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-wrise-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Connect Your Instagram</h1>
          <p className="text-gray-600 text-base">
            Link your Instagram account so Wrise can analyze your content and pull in your latest reels and comments.
          </p>
        </div>

        {/* Connect Card */}
        <div className="max-w-lg mx-auto bg-white border rounded-2xl shadow-md p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Instagram size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Instagram</h3>
              <p className="text-sm text-gray-500">Connect your profile to fetch content.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram-username" className="text-sm font-medium">
              Instagram Username
            </Label>
            <Input
              id="instagram-username"
              placeholder="e.g. natgeo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={connected.instagram}
            />
          </div>

          {connected.instagram ? (
            <div className="flex items-center text-green-600 font-medium gap-2">
              <Check size={20} />
              Connected
            </div>
          ) : (
            <Button
              onClick={handleScrape}
              disabled={loading || !username}
              className="w-full btn-gradient"
            >
              {loading ? "Connecting…" : "Connect"}
            </Button>
          )}
        </div>

        {/* Reels Preview */}
        {reels.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold">Fetched Reels</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {reels.map((reel, i) => (
                <div
                  key={i}
                  className="border bg-white rounded-xl p-3 shadow hover:shadow-md transition"
                >
                  <video src={reel.videoUrl} controls className="w-full rounded mb-3" />
                  {reel.latestComments?.length > 0 && (
                    <div className="text-sm space-y-1">
                      <h5 className="font-semibold mb-1">Latest Comments</h5>
                      <ul className="list-disc list-inside max-h-32 overflow-y-auto space-y-1">
                        {reel.latestComments.map((c, j) => (
                          <li key={j}>
                            <span className="font-semibold">{c.ownerUsername}:</span> {c.text}
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default ConnectInstagram;
