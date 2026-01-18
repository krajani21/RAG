import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold mb-4">🎉 Payment Successful!</h1>
      <p className="text-lg text-gray-600 mb-8">You now have access to your dashboard.</p>
      <Link to="/onboarding">
        <Button className="bg-wrise-primary text-white px-6 py-3 text-lg">Start Onboarding</Button>
      </Link>
    </div>
  );
}
