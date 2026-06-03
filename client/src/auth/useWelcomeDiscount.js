// src/auth/useWelcomeDiscount.js
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../lib/apiClient";

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
        const result = await apiFetch("/api/user/login", {
          method: "POST",
          auth: true,
          credentials: "include",
          body: { userId: user.uid },
          throwOnError: false,
        });
        if (!result.ok) return;
        const data = result.data;
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
      await apiFetch("/api/user/dismiss-banner", {
        method: "POST",
        auth: true,
        credentials: "include",
        body: { userId: user.uid },
      });
    } catch (err) {
      console.error("dismissBanner error:", err);
    }
  };

  return { showBanner, discountEligible, discountPercent, dismissBanner };
}
