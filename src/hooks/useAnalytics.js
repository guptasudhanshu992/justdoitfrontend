/**
 * Google Analytics 4 Hook
 * Provides GA4 tracking functionality throughout the app
 */

import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

// Get Measurement ID from environment variable
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Track if GA has been initialized
let isInitialized = false;

/**
 * Initialize Google Analytics 4
 * Should be called once at app startup
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    console.warn(
      "Google Analytics: Measurement ID not configured. Add VITE_GA_MEASUREMENT_ID to .env file."
    );
    return false;
  }

  if (isInitialized) {
    return true;
  }

  try {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // GDPR compliance
      },
    });
    isInitialized = true;
    console.log("Google Analytics initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
    return false;
  }
};

/**
 * Check if GA is enabled and initialized
 */
export const isGAEnabled = () => {
  return isInitialized && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX";
};

/**
 * Track a page view
 * @param {string} path - The page path
 * @param {string} title - The page title
 */
export const trackPageView = (path, title) => {
  if (!isGAEnabled()) return;
  
  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: title,
  });
};

/**
 * Track a custom event
 * @param {string} category - Event category
 * @param {string} action - Event action
 * @param {string} label - Event label (optional)
 * @param {number} value - Event value (optional)
 */
export const trackEvent = (category, action, label, value) => {
  if (!isGAEnabled()) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

/**
 * Track blog post view
 * @param {string} postId - Blog post ID
 * @param {string} postTitle - Blog post title
 * @param {string} category - Blog post category
 */
export const trackBlogPostView = (postId, postTitle, category) => {
  if (!isGAEnabled()) return;

  ReactGA.event({
    category: "Blog",
    action: "View Post",
    label: postTitle,
    post_id: postId,
    post_category: category,
  });
};

/**
 * Track blog post engagement
 * @param {string} postId - Blog post ID
 * @param {string} action - Engagement action (share, comment, like, etc.)
 */
export const trackBlogEngagement = (postId, action) => {
  if (!isGAEnabled()) return;

  ReactGA.event({
    category: "Blog Engagement",
    action: action,
    label: postId,
  });
};

/**
 * Track media upload
 * @param {string} mediaType - Type of media (image, video, file)
 * @param {string} fileName - File name
 */
export const trackMediaUpload = (mediaType, fileName) => {
  if (!isGAEnabled()) return;

  ReactGA.event({
    category: "Media",
    action: "Upload",
    label: mediaType,
    file_name: fileName,
  });
};

/**
 * Track admin action
 * @param {string} action - Action performed
 * @param {string} resource - Resource type (post, category, tag, media)
 */
export const trackAdminAction = (action, resource) => {
  if (!isGAEnabled()) return;

  ReactGA.event({
    category: "Admin",
    action: action,
    label: resource,
  });
};

/**
 * Custom hook for automatic page view tracking
 * Use this in components that need page view tracking
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (isGAEnabled()) {
      trackPageView(location.pathname + location.search, document.title);
    }
  }, [location]);
};

/**
 * Custom hook providing all analytics functions
 */
export const useAnalytics = () => {
  const location = useLocation();

  // Track page view on route change
  useEffect(() => {
    if (isGAEnabled()) {
      trackPageView(location.pathname + location.search, document.title);
    }
  }, [location]);

  // Memoized tracking functions
  const trackBlogView = useCallback((postId, postTitle, category) => {
    trackBlogPostView(postId, postTitle, category);
  }, []);

  const trackEngagement = useCallback((postId, action) => {
    trackBlogEngagement(postId, action);
  }, []);

  const trackUpload = useCallback((mediaType, fileName) => {
    trackMediaUpload(mediaType, fileName);
  }, []);

  const trackAdmin = useCallback((action, resource) => {
    trackAdminAction(action, resource);
  }, []);

  const sendEvent = useCallback((category, action, label, value) => {
    trackEvent(category, action, label, value);
  }, []);

  return {
    isEnabled: isGAEnabled(),
    trackBlogView,
    trackEngagement,
    trackUpload,
    trackAdmin,
    sendEvent,
  };
};

export default useAnalytics;
