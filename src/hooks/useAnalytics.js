import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/axios";
import useAuthStore from "../store/authStore";

const SESSION_ID_KEY = "naye_nails_session_id";

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const useAnalytics = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const pageLoadTime = useRef(Date.now());
  const activeTime = useRef(0);
  const lastActivityTime = useRef(Date.now());
  const visibilityState = useRef(document.visibilityState);

  const trackTimeOnPage = (path, duration) => {
    const data = JSON.stringify({
      sessionId: sessionStorage.getItem(SESSION_ID_KEY),
      path: path,
      duration: duration,
    });
    navigator.sendBeacon("/api/analytics/track-time", data);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (visibilityState.current === "visible" && document.visibilityState === "hidden") {
        activeTime.current += (Date.now() - lastActivityTime.current) / 1000;
      } else if (visibilityState.current === "hidden" && document.visibilityState === "visible") {
        lastActivityTime.current = Date.now();
      }
      visibilityState.current = document.visibilityState;
    };

    const handleBeforeUnload = () => {
      if (document.visibilityState === "visible") {
        activeTime.current += (Date.now() - lastActivityTime.current) / 1000;
      }
      trackTimeOnPage(location.pathname + location.search, activeTime.current);
    };

    if (!isAuthenticated) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (!isAuthenticated) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, [location.pathname, location.search, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    const previousPath = location.pathname + location.search;
    const previousActiveTime = activeTime.current;

    if (previousActiveTime > 0) {
      trackTimeOnPage(previousPath, previousActiveTime);
    }

    pageLoadTime.current = Date.now();
    activeTime.current = 0;
    lastActivityTime.current = Date.now();

    const trackPageView = async () => {
      try {
        await apiClient.post("/visitas/track", {
          sessionId: sessionId,
          path: location.pathname + location.search,
          referrer: document.referrer,
        });
      } catch (error) {
        console.warn("Analytics tracking failed:", error.message);
      }
    };

    trackPageView();
  }, [location.pathname, location.search, isAuthenticated]);
};
