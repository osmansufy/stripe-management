import React, { createContext, useContext, useState, useEffect } from "react";
import Stripe from "stripe";

// Keep the client pinned to the same API version as the Dashboard (test mode)
// to avoid behavior mismatches between manual Dashboard actions and API calls.
const STRIPE_API_VERSION = "2025-06-30.basil";

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error("useStripe must be used within a StripeProvider");
  }
  return context;
};

export const StripeProvider = ({ children, onNotification }) => {
  const [stripe, setStripe] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load API key on app start
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.getApiKey();
        if (result.success && result.data) {
          setApiKey(result.data);
          initializeStripe(result.data);
        }
      } else {
        // For development, check localStorage
        const storedKey = localStorage.getItem("stripe_api_key");
        if (storedKey) {
          setApiKey(storedKey);
          initializeStripe(storedKey);
        }
      }
    } catch (error) {
      console.error("Error loading API key:", error);
    }
  };

  const initializeStripe = (key) => {
    if (key && key.startsWith("sk_")) {
      try {
        const stripeInstance = new Stripe(key, {
          apiVersion: STRIPE_API_VERSION,
        });
        setStripe(stripeInstance);
        setIsConnected(true);
        onNotification?.("Connected to Stripe successfully", "success");
      } catch (error) {
        console.error("Error initializing Stripe:", error);
        onNotification?.("Invalid API key format", "error");
      }
    } else {
      setStripe(null);
      setIsConnected(false);
    }
  };

  const setApiKeyAndStore = async (key) => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.storeApiKey(key);
        if (result.success) {
          setApiKey(key);
          initializeStripe(key);
          onNotification?.("API key saved successfully", "success");
        } else {
          onNotification?.(result.error || "Failed to save API key", "error");
        }
      } else {
        // For development, use localStorage
        localStorage.setItem("stripe_api_key", key);
        setApiKey(key);
        initializeStripe(key);
        onNotification?.("API key saved successfully", "success");
      }
    } catch (error) {
      console.error("Error storing API key:", error);
      onNotification?.("Failed to save API key", "error");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setStripe(null);
    setApiKey("");
    setIsConnected(false);
    if (window.electronAPI) {
      // Clear stored key
    } else {
      localStorage.removeItem("stripe_api_key");
    }
    onNotification?.("Disconnected from Stripe", "info");
  };

  const testConnection = async () => {
    if (!stripe) {
      onNotification?.("No Stripe instance available", "error");
      return false;
    }

    try {
      await stripe.balance.retrieve();
      onNotification?.("Connection test successful", "success");
      return true;
    } catch (error) {
      onNotification?.(`Connection test failed: ${error.message}`, "error");
      return false;
    }
  };

  const value = {
    stripe,
    apiKey,
    isConnected,
    loading,
    setApiKey: setApiKeyAndStore,
    disconnect,
    testConnection,
  };

  return (
    <StripeContext.Provider value={value}>{children}</StripeContext.Provider>
  );
};
