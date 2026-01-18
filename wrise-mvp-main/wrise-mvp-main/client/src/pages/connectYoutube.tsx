import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** simple three‑step flow */
const steps = [
  { id: "connect", title: "Connect" },
  { id: "analyze", title: "Analyzing" },
  { id: "done", title: "Done" },
];

const ConnectYoutube = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [connected, setConnected] = useState({
  youtube: false,
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      if (steps[currentStep + 1].id === "analyze") simulateAnalysis();
    }
  };

  const simulateAnalysis = () => {
    setLoading(true);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setLoading(false);
          setTimeout(() => setCurrentStep((s) => s + 1), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleConnect = () => {
    window.location.href = "https://clonark.onrender.com/auth/google";
    setConnected((prev) => ({ ...prev, youtube: true }));
  };
  return (
 <div className="container mx-auto px-4 py-20 space-y-12">
      {/* back link */}
      <div className="max-w-3xl mx-auto">
        <Link
          to="/connect"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-wrise-primary transition"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Connect Social Media
        </Link>
      </div>

      {/* header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Connect Your YouTube</h1>
        <p className="text-gray-600">
          Link your channel so Wrise can analyze your videos, pull transcripts, and engage your audience in one place.
        </p>
      </div>

      {/* connection card */}
      <div className="max-w-lg mx-auto bg-white border rounded-2xl shadow-md p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Youtube size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">YouTube</h3>
            <p className="text-sm text-gray-500">Connect your channel</p>
          </div>
        </div>

        {connected.youtube ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <Check size={20} /> Connected
          </div>
        ) : (
          <Button onClick={handleConnect}>Connect</Button>
        )}
      </div>

      {/* progress bar */}
      {loading && (
        <div className="max-w-lg mx-auto">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectYoutube;
