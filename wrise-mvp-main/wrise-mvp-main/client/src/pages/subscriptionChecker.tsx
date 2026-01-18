import React, { useEffect, useState } from "react";

interface SubscriptionCheckerProps {
  creatorId: string;
  fanId: string;
}

const SubscriptionChecker: React.FC<SubscriptionCheckerProps> = ({ creatorId, fanId }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId || !fanId) {
      setError("Missing creatorId or fanId");
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://clonark.onrender.com/api/subscription/status/${creatorId}`, {    //need to change this to the correct endpoint
          method: "GET",
          headers: {
            "x-user-id": fanId,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 200) {
          setHasAccess(true);
        } else if (res.status === 402) {
          setHasAccess(false);
        } else if (res.status === 401) {
          setError("Unauthorized: Fan ID missing or invalid.");
          setHasAccess(false);
        } else {
          const data = await res.json();
          setError(data.error || "Unknown error");
          setHasAccess(false);
        }
      } catch (err) {
        setError("Network error: " + (err as Error).message);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [creatorId, fanId]);

  if (loading) return <p>Checking subscription status...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (hasAccess) return <p>Access granted! Enjoy the exclusive content.</p>;

  return <p>You need to subscribe to access this content.</p>;
};

export default SubscriptionChecker;
