// QueueThresholdContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface QueueThresholdContextType {
  queueThreshold: number;
  setQueueThreshold: (value: number) => void;
}

const QueueThresholdContext = createContext<QueueThresholdContextType | undefined>(undefined);

export const QueueThresholdProvider = ({ children }: { children: ReactNode }) => {
  const [queueThreshold, setQueueThreshold] = useState<number>(1); // Default threshold is 1

  return (
    <QueueThresholdContext.Provider value={{ queueThreshold, setQueueThreshold }}>
      {children}
    </QueueThresholdContext.Provider>
  );
};

export const useQueueThreshold = (): QueueThresholdContextType => {
  const context = useContext(QueueThresholdContext);
  if (!context) {
    throw new Error("useQueueThreshold must be used within a QueueThresholdProvider");
  }
  return context;
};
