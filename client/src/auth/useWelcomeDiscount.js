// src/auth/useWelcomeDiscount.js
import { useState, useEffect, useRef } from "react";
import apiClient from "../lib/apiClient";

 || "http://localhost:5000";

export function useWelcomeDiscount(user) {
  const [showBanner, setShowBanner] = useState(false);
  const [discountEligible, setDiscountEligible] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);
  const calledRef = useRef(false);

  useEffect(() => {
    if (!user || calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        const res = await apiClient(`/api/user/login`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ userId: user.uid }),
        });
        const data = res;
        if (data.showBanner && !data.discountUsed) {
          setShowBanner(true);
          setDiscountEligible(true);
          setDiscountPercent(data.discountPercent ?? 10);
        }
      } catch (err) {
        console.error("useWelcomeDiscount error:", err);
      }
    })();
  }, [user]);

  const dismissBanner = async () => {
    setShowBanner(false);
    if (!user) return;
    try {
      await apiClient(`/api/user/dismiss-banner`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ userId: user.uid }),
      });
    } catch (err) {
      console.error("dismissBanner error:", err);
    }
  };

  return { showBanner, discountEligible, discountPercent, dismissBanner };
}