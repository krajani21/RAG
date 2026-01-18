
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check, Instagram, Youtube } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const steps = [
  {
    id: "welcome",
    title: "Create your Fan Hub",
    description: "Let's turn your content into an interactive experience for your fans.",
  },
  {
    id: "customize",
    title: "Customize your hub",
    description: "Let's make your fan hub feel uniquely yours.",
  },
  {
    id: "pricing",
    title: "Set your pricing",
    description: "Choose how much to charge for premium access.",
  },
  {
    id: "launch",
    title: "Ready to launch!",
    description: "Your fan hub is set up and ready to share with your audience.",
  },
];

const MOCK_CONTENT = {
  videos: 267,
  posts: 412,
  comments: 3890,
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reels, setReels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    welcome: "",
    isCreator: false,
    tone: "friendly",
    pricing: "7.99",
  });
  const [connected, setConnected] = useState({
    youtube: false,
    instagram: false,
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      if (steps[currentStep + 1].id === "analyze") {
        simulateAnalysis();
      }
    }
  };

  const simulateAnalysis = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLaunch = () => {
    toast.success("Your fan hub is now live! 🎉", {
      description: "Share it with your audience and start engaging with your fans.",
    });
    setTimeout(() => {
      navigate("/creator-dashboard");
    }, 2000);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case "welcome":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Enter your Fan Hub Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>            
            <Button 
              className="w-full btn-gradient"
              onClick={handleNext}
            >
              {loading ? "Creating account..." : "next"}
            </Button>
          </div>
        );
        
      case "customize":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="welcome">Welcome message</Label>
              <Textarea
                id="welcome"
                name="welcome"
                placeholder="Write a personal welcome message for your fans..."
                className="min-h-[120px]"
                value={formData.welcome}
                onChange={handleInputChange}
              />
              <p className="text-sm text-gray-500">
                This will be displayed at the top of your fan hub.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tone">Response tone</Label>
              <select
                id="tone"
                name="tone"
                className="w-full border rounded-md px-3 py-2"
                value={formData.tone}
                onChange={handleInputChange}
              >
                <option value="friendly">Friendly & Approachable</option>
                <option value="professional">Professional & Polished</option>
                <option value="casual">Casual & Relaxed</option>
                <option value="enthusiastic">Enthusiastic & Energetic</option>
                <option value="educational">Educational & Informative</option>
              </select>
              <p className="text-sm text-gray-500">
                How should responses to fan questions sound?
              </p>
            </div>
            
            <Button 
              className="w-full btn-gradient"
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        );
        
      case "pricing":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Set a monthly subscription price for full access to your fan hub.
              </p>
            </div>
            
            <div className="border rounded-xl p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pricing">Monthly subscription price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="pricing"
                    name="pricing"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={formData.pricing}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Recommended pricing: $4.99 - $9.99/month
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">With {parseFloat(formData.pricing || "0").toFixed(2)}/month you can earn:</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-wrise-primary">${(parseFloat(formData.pricing || "0") * 50).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">with 50 subscribers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-wrise-primary">${(parseFloat(formData.pricing || "0") * 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">with 100 subscribers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-wrise-primary">${(parseFloat(formData.pricing || "0") * 500).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">with 500 subscribers</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full btn-gradient"
              onClick={handleNext}
              disabled={!formData.pricing || parseFloat(formData.pricing) <= 0}
            >
              Continue
            </Button>
          </div>
        );
        
      case "launch":
        return (
          <div className="space-y-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Check size={40} className="text-white" />
                </div>
              </div>
              
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-confetti"
                  style={{
                    backgroundColor: i % 3 === 0 ? "#A88BFF" : i % 3 === 1 ? "#88F0D3" : "#3A0CA3",
                    top: "50%",
                    left: "50%",
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Your Fan Hub is Ready!</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You've successfully created your Wrise fan hub. It's time to share it with your audience!
            </p>
            
            <div className="border rounded-lg p-4 bg-gray-50 mb-6 max-w-sm mx-auto">
              <p className="font-medium mb-2">Your fan hub link:</p>
              <div className="bg-white border rounded-md p-2 flex items-center justify-between">
                {/* <span className="text-gray-600 truncate">wrise.io/chat/{user?.id}</span> */}
                {/* <span className="text-gray-600 truncate">https://clonark.com/chat/{user?.id}</span>    */}
                {user?.id ? (
                  <span className="text-gray-600 truncate">
                    https://clonark.com/chat/{user.id}
                  </span>
                ) : (
                  <span>Loading fan hub...</span>
                )}
                <button 
                className="text-wrise-primary text-sm font-medium"
                onClick={() => {
                  const link = `https://clonark.com/chat/${user?.id}`;
                  navigator.clipboard.writeText(link);
                  toast.success("Link copied to clipboard!");
                }}
                >
                  Copy
                </button>
              </div>
            </div>
            
            <Button 
              className="w-full btn-gradient"
              onClick={handleLaunch}
            >
              Go to dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Progress sidebar */}
      <div className="hidden lg:block w-80 bg-white border-r p-8">
        <div className="flex items-center gap-2 mb-12">
          <div className="bg-gradient-primary rounded-lg w-8 h-8 flex items-center justify-center">
            <span className="font-bold text-white">W</span>
          </div>
          <span className="font-bold text-xl">Wrise</span>
        </div>
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-start gap-3 p-3 rounded-lg ${
                currentStep === index 
                  ? "bg-wrise-primary/10 text-wrise-primary"
                  : currentStep > index 
                  ? "text-gray-400" 
                  : "text-gray-500"
              }`}
            >
              <div 
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                  currentStep > index 
                    ? "bg-green-500 text-white" 
                    : currentStep === index 
                    ? "bg-wrise-primary text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > index ? (
                  <Check size={14} />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-orange-950">{steps[currentStep].description}</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

