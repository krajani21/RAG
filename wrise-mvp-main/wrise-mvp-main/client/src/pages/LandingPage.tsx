
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


const LandingPage = () => {
const [videos, setVideos] = useState([]);
const [loading, setLoading] = useState(false);
const [transcript, setTranscript] = useState<string[]>([]);


useEffect(() => {
  const fetchYouTubeVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://clonark.onrender.com/api/youtube/videos", {
        credentials: "include", // includes session cookie
      });
      if (!res.ok) throw new Error("Failed to fetch videos");

      const data = await res.json();
      setVideos(data);
      if (data.length > 0) {
  const videoId = data[0].snippet.resourceId?.videoId || data[0].snippet.videoId; // fallback if shape varies

  try {
    const resTranscript = await fetch(`https://clonark.onrender.com/api/youtube/transcripts/${videoId}`);
    if (!resTranscript.ok) throw new Error("Failed to fetch transcript");
    
    const transcriptData = await resTranscript.json();
    console.log("transcript raw data: ", transcriptData);
    setTranscript(transcriptData.map((t: any) => t.text)); // Extract only the text
    console.log("Mapped transcript text:", transcriptData.map((t: any) => t.text));
  } catch (err) {
    console.error("Transcript fetch error:", err);
  }
}

      console.log("Fetched videos:", data); // optional
    } catch (err) {
      console.error("YouTube fetch error:", err);
    } finally {
      setLoading(false);
    }
    
  };

  fetchYouTubeVideos();
}, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-transparent z-[-1]"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white border border-wrise-border shadow-sm">
              <span className="text-sm font-medium">
                <span className="text-wrise-primary">Creator-First</span> Fan Engagement
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Turn Your Social Content Into an Interactive{" "}
              <span className="gradient-text">Fan Hub</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto">
              Wrise automatically transforms your Instagram & YouTube content into an engaging
              fan experience — answer questions, nurture fans, and monetize your knowledge
              without being present.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button className="btn-gradient text-lg rounded-full px-8 py-6 h-auto">
                  Create Your Fan Hub <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/hub/demo">
                <Button variant="outline" className="text-lg rounded-full px-8 py-6 h-auto">
                  See Demo Hub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Wrise Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your content becomes an interactive experience that engages fans
              while you focus on creating.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect & Sync",
                description:
                  "Link your YouTube and Instagram to automatically import ALL of your content.",
                icon: "🔌",
              },
              {
                title: "AI Analysis",
                description:
                  "Wrise analyzes your content to identify themes, topics, and frequently asked questions.",
                icon: "🧠",
              },
              {
                title: "Fan Engagement",
                description:
                  "Let fans explore your content through natural conversation and curated topics.",
                icon: "💬",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="card-premium p-8 relative overflow-hidden"
              >
                <div className="mb-4 text-3xl">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Feature Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Turn Engagement Into Revenue</h2>
              <p className="text-lg text-gray-600 mb-8">
                Create a premium experience for your fans while generating recurring revenue through subscription access.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Automatically detect high-engagement triggers",
                  "Send fans to your hub from social comments",
                  "Set up monthly subscriptions with one click",
                  "Track detailed analytics on fan interests",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCheck className="h-6 w-6 text-wrise-accent mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="card-premium p-6 shadow-lg max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="font-bold text-white">S</span>
                    </div>
                    <div>
                      <h4 className="font-bold">Sarah's Fan Hub</h4>
                      <p className="text-sm text-gray-500">Travel & Photography</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-wrise-accent/20 text-wrise-contrast rounded-full text-sm font-medium">
                    +143 subs
                  </div>
                </div>
                
                <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                  <p className="text-sm">
                    "How do I edit my photos like you do?"
                  </p>
                </div>
                
                <div className="border border-wrise-primary/30 rounded-xl p-4 mb-4 bg-wrise-primary/5">
                  <p className="text-sm">
                    I use Lightroom with my custom presets. I start by adjusting exposure, then work on colors using my signature warm-tone technique. Check out my full walkthrough in my "Beach Editing" video from May!
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Topics: Editing, Photography, Presets</div>
                  <div className="text-sm text-wrise-primary">$7.99/mo</div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-wrise-contrast text-white px-4 py-2 rounded-lg text-sm font-medium transform rotate-3">
                Real Responses, No Work
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Creators Love Wrise</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how creators are building deeper connections and generating revenue with their fan hubs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Chen",
                role: "Fitness Creator",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
                quote:
                  "My fan hub has become my top revenue source, and I barely have to maintain it. It answers questions better than I could!",
                stats: "$4.2k/mo",
              },
              {
                name: "Aisha Johnson",
                role: "Business Coach",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
                quote:
                  "Wrise helped me scale my coaching business by creating a place for fans to get personalized advice based on my content.",
                stats: "432 subscribers",
              },
              {
                name: "David Park",
                role: "Travel Vlogger",
                avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100",
                quote:
                  "I was overwhelmed with questions on Instagram. Now I send people to my hub and make money while I sleep!",
                stats: "12.5k interactions",
              },
            ].map((item, index) => (
              <div key={index} className="card-premium p-8">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">"{item.quote}"</p>
                <div className="text-sm font-medium text-wrise-primary">
                  {item.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Building Your Fan Hub Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Connect your accounts, set your price, and launch within minutes.
            No technical skills required.
          </p>
          <Link to="/onboarding">
            <Button className="bg-white text-wrise-primary hover:bg-white/90 text-lg rounded-full px-8 py-6 h-auto">
              Create Your Hub <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {transcript.length > 0 && (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Transcript of First Video</h2>
            <div className="space-y-2">
              {transcript.map((line, idx) => (
                <p key={idx} className="text-gray-700">{line}</p>
              ))}
            </div>
          </div>
        </section>
      )}
    <Footer />
    </div>
  );
};

export default LandingPage;
