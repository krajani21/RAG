// client/src/pages/PaymentCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: show loading spinner briefly
    const timer = setTimeout(() => {
      navigate("/success");
    }, 2000); // You can reduce to 500ms if preferred

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <p className="text-lg font-medium">⏳ Verifying payment...</p>
      <p className="text-sm text-gray-500 mt-2">You'll be redirected shortly.</p>
    </div>
  );
}