import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../shared/stores/authStore";

// Socket.IO connects to the root server, not /api
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

interface Notification {
  type: string;
  donationId?: string;
  donationTitle?: string;
  status?: string;
  message: string;
  reason?: string;
}

// Singleton socket instance - shared across all hook calls
let globalSocket: Socket | null = null;
let globalNotifications: Notification[] = [];
let globalUnreadCount = 0;
let currentToken: string | null = null; // Track current token
const listeners: Set<
  (notifications: Notification[], unreadCount: number) => void
> = new Set();
let isInitializing = false; // Global flag to prevent multiple connections

// Function to disconnect and cleanup WebSocket
export const disconnectWebSocket = () => {
  console.log("🔌 Disconnecting WebSocket...");
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket.removeAllListeners();
    globalSocket = null;
  }
  globalNotifications = [];
  globalUnreadCount = 0;
  currentToken = null;
  isInitializing = false;
  listeners.clear();
  console.log("✅ WebSocket disconnected and cleaned up");
};

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If user is not authenticated, disconnect socket if exists
    if (!isAuthenticated || !accessToken) {
      console.log("⚠️ No authentication found, skipping WebSocket connection");
      if (globalSocket) {
        console.log("🔌 Disconnecting existing socket due to logout");
        disconnectWebSocket();
      }
      return;
    }

    // If socket exists but with different token, disconnect and reconnect
    if (globalSocket && currentToken && currentToken !== accessToken) {
      console.log("🔄 Token changed, reconnecting WebSocket with new token...");
      disconnectWebSocket();
    }

    // If socket already exists with same token, just subscribe to notifications
    if (globalSocket && currentToken === accessToken) {
      console.log("🔄 Reusing existing WebSocket connection");
      setIsConnected(globalSocket.connected);
      setNotifications(globalNotifications);
      setUnreadCount(globalUnreadCount);

      // Subscribe to notification updates
      const listener = (notifs: Notification[], unread: number) => {
        setNotifications(notifs);
        setUnreadCount(unread);
      };
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }

    // Only create socket if not already initializing
    if (isInitializing) {
      console.log("⏳ Socket already initializing, waiting...");
      return;
    }

    isInitializing = true;
    currentToken = accessToken;

    console.log(
      "🔑 Token found, connecting to WebSocket:",
      accessToken.substring(0, 20) + "..."
    );
    console.log("🌐 Connecting to:", SOCKET_URL);

    // Initialize socket connection (only once)
    globalSocket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
    });

    const socket = globalSocket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ WebSocket connected:", socket.id);
      isInitializing = false;
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      isInitializing = false;
      setIsConnected(false);
    });

    // Listen for notifications
    socket.on("notification", (data: any) => {
      console.log("🔔 New notification:", data);

      // Check for duplicates - handle both donation and system notifications
      const isDuplicate = globalNotifications.some(
        (notif) =>
          notif.type === data.type &&
          notif.message === data.message &&
          (data.donationId ? notif.donationId === data.donationId : true) &&
          Math.abs(new Date().getTime() - new Date(notif.createdAt || 0).getTime()) < 1000
      );

      if (isDuplicate) {
        console.log("⚠️ Duplicate notification detected, skipping...");
        return;
      }

      globalNotifications = [data, ...globalNotifications];
      globalUnreadCount += 1;

      // Update all listeners
      listeners.forEach((listener) =>
        listener(globalNotifications, globalUnreadCount)
      );

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification(data.title || data.donationTitle || "KindLoop", {
          body: data.message,
          icon: "/logo.png",
        });
      }
    });

    // Listen for donation updates
    socket.on("donation:update", (data) => {
      console.log("📦 Donation updated:", data);
    });

    // Subscribe current component to notifications
    const listener = (notifs: Notification[], unread: number) => {
      setNotifications(notifs);
      setUnreadCount(unread);
    };
    listeners.add(listener);

    // Cleanup - don't disconnect, just unsubscribe
    return () => {
      listeners.delete(listener);
    };
  }, [accessToken, isAuthenticated]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const clearNotifications = () => {
    globalNotifications = [];
    globalUnreadCount = 0;
    listeners.forEach((listener) =>
      listener(globalNotifications, globalUnreadCount)
    );
  };

  const removeNotification = (index: number) => {
    globalNotifications = globalNotifications.filter((_, i) => i !== index);
    if (globalUnreadCount > 0) {
      globalUnreadCount -= 1;
    }
    listeners.forEach((listener) =>
      listener(globalNotifications, globalUnreadCount)
    );
  };

  const markAllAsRead = () => {
    globalUnreadCount = 0;
    listeners.forEach((listener) =>
      listener(globalNotifications, globalUnreadCount)
    );
  };

  return {
    isConnected,
    notifications,
    unreadCount,
    clearNotifications,
    removeNotification,
    markAllAsRead,
    socket: globalSocket,
  };
};
