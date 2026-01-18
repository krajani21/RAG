// src/pages/FanLandingPage.tsx
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Creator {
  id: string;
  name: string;
  category?: string;
  tagline?: string;
  imageUrl?: string;
}

const DEFAULT_IMAGE = "https://via.placeholder.com/400x300?text=Creator+Image";

const FanLandingPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const sampleCreators: Creator[] = [
    {
      id: "sample1",
      name: "Jane Doe",
      tagline: "Empowering wellness through daily routines",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=900&h=900",
    },
    {
      id: "sample2",
      name: "John Smith",
      tagline: "Your daily photography inspiration",
      imageUrl:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=900&h=900",
    },
    {
      id: "sample3",
      name: "Samantha Lee",
      tagline: "Vegan recipes for mindful living",
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=900&h=900",
    },
  ];

  useEffect(() => {
    const fetchFanData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`https://clonark.onrender.com/api/fan/subscriptions/${user.id}`);
        const data = await res.json();
        setSubscriptions(data || []);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFanData();
  }, [user]);

  const isEmpty = subscriptions.length === 0;
  const creatorsToDisplay = isEmpty ? sampleCreators : subscriptions;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-32 pb-20 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Fan Dashboard</h1>
        <p className="text-lg text-gray-600 mb-10">
          {loading
            ? "Loading your subscriptions..."
            : isEmpty
            ? "Explore exclusive content and subscribe to your favorite creators"
            : "Enjoy exclusive content from creators you follow"}
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {loading ? (
            <p className="col-span-3 text-gray-400">Loading creators...</p>
          ) : (
            creatorsToDisplay.map((creator) => (
              <Link
                to={`/profile/${creator.id}`}
                key={creator.id}
                className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300 bg-white"
              >
                {/* Background Image Section */}
                <div
                  className="h-[400px] bg-center bg-no-repeat bg-contain bg-gray-100 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${creator.imageUrl || DEFAULT_IMAGE})`,
                  }}
                ></div>

                {/* Creator Name and Tagline */}
                <div className="p-4 text-left">
                  <h3 className="text-gray-900 text-lg font-bold mb-1">{creator.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {creator.tagline || creator.category || "Creator"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FanLandingPage;




