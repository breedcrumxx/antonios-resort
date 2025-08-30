"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import React, { createContext, useContext, useState } from "react";

type SimpleNotificationType = {
  message: string,
  status: "success" | "error",
  duration?: number,
  icon?: JSX.Element
}

type Notification = {
  id: number;
  message: string;
  status: "success" | "error"
};

type NotificationContextType = {
  simpleNotification: ({ message, status, duration, icon }: SimpleNotificationType) => void;
};

const SimpleNotificationContext = createContext<NotificationContextType>({
  simpleNotification: () => { }
});

export const SimpleNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Function to add a new notification
  function simpleNotification({ message, status, duration = 5000, icon }: SimpleNotificationType) {
    const id = Date.now(); // a way to identify each notification

    setNotifications((prev) => [...prev, { id, message, status }]);

    setTimeout(() => { // remove the element after a duration
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, duration);
  }

  return (
    <SimpleNotificationContext.Provider value={{ simpleNotification }}>
      {children}
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              className={clsx("w-max flex gap-2 items-center text-white text-xs py-2 px-4 rounded-full shadow-md", {
                "bg-green-500": notification.status == "success",
                "bg-red-500": notification.status == "error",
              })}
              initial={{ opacity: 0, y: "-15%" }}
              animate={{ opacity: 1, y: "0" }}
              exit={{ opacity: 0, y: "-15%" }}
            >
              {notification.status == "success" ? (<><Check className="h-4 w-4" /></>) : (<><X className="h-4 w-4" /></>)}
              <p>
                {notification.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SimpleNotificationContext.Provider>
  );
};

// Hook to use the notification context
export const useSimpleNotification = () => {
  const context = useContext(SimpleNotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};