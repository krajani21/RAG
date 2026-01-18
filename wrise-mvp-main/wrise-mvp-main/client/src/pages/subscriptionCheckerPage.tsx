// SubscriptionCheckerPage.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import SubscriptionChecker from "./subscriptionChecker";

const SubscriptionCheckerPage = () => {
  const [searchParams] = useSearchParams();
  const creatorId = searchParams.get("creatorId") || "";
  const fanId = searchParams.get("fanId") || "";

  return <SubscriptionChecker creatorId={creatorId} fanId={fanId} />;
};

export default SubscriptionCheckerPage;
