import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";

interface Creator {
  id: string;
  name: string;
  imageUrl?: string;
  tagline?: string;
  description?: string;
  questions?: string[];
}

const DEFAULT_IMAGE = "https://via.placeholder.com/400x300?text=Creator+Image";

const sampleProfiles: Record<string, Creator> = {
  sample1: {
    id: "sample1",
    name: "Jane Doe",
    imageUrl: "", // no image = initial avatar
    tagline: "3-time NYT bestselling author",
    description: "Jane Doe is a renowned author and speaker.",
    questions: [
      "How can one's energy influence the people around them?",
      "How does regular exercise contribute to your mental performance and overall success?",
      "Does high performance correlate with personality or is it more tied to desires for growth, achievement, and contribution?",
      "What are the six habits that you found to be most effective for achieving long-term success?",
    ],
  },
};

const ProfilePage = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setCreator(sampleProfiles[id] || null);
    }
  }, [id]);

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Creator not found.</p>
      </div>
    );
  }

  const initial = creator.name.charAt(0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 hover:text-black flex items-center gap-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600">
            {initial}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{creator.name}</h1>
          <p className="text-gray-600">{creator.tagline}</p>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => navigate("/fan-dashboard")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              Text
            </button>
            <button
                onClick={() => navigate("/coming-soon")} 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Voice
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 text-gray-700">
          <h2 className="font-semibold mb-2 text-lg">Description</h2>
          <p>{creator.description}</p>
        </div>

        {/* Suggested Questions */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Suggested Questions</h2>
          <ul className="space-y-4">
            {creator.questions?.map((q, index) => (
              <li
                key={index}
                className="flex items-start gap-2 bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm text-gray-800"
              >
                <Sparkles className="w-5 h-5 text-orange-400 mt-1" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ask a Question Input */}
        <div className="mt-8 flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm">
          <input
            type="text"
            placeholder={`Ask ${creator.name} a question`}
            className="flex-grow outline-none bg-transparent text-sm px-2"
          />
          <button 
            onClick={() => navigate("/fan-dashboard")}
            className="text-white bg-orange-500 hover:bg-orange-600 rounded-full p-2"
            >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

