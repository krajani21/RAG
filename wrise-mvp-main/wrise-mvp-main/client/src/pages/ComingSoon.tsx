// src/pages/ComingSoon.tsx
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">🚧 Coming Soon</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We're working hard on this feature. Stay tuned — voice chat is on the way!
      </p>
      <Link to="/" className="text-orange-500 font-medium hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
};

export default ComingSoon;
