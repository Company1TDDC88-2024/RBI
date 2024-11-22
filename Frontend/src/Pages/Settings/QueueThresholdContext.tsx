// // QueueThresholdContext.tsx
// import React, { createContext, useContext, useState, ReactNode } from "react";

// interface QueueThresholdContextType {
//   thresholds: { [roi: string]: number }; // Map of ROI to thresholds
//   setThresholdForROI: (roi: string, value: number) => void;
// }

// const QueueThresholdContext = createContext<QueueThresholdContextType | undefined>(undefined);

// export const QueueThresholdProvider = ({ children }: { children: ReactNode }) => {
//   const [thresholds, setThresholds] = useState<{ [roi: string]: number }>({});


//   const setThresholdForROI = (roi: string, value: number) => {
//     console.log(`Updating thresholds: ROI ${roi}, Value: ${value}`); // Debug log
//     setThresholds((prev) => ({ ...prev, [roi]: value })); // Update threshold
// };

//   return (
//     <QueueThresholdContext.Provider value={{ thresholds, setThresholdForROI }}>
//       {children}
//     </QueueThresholdContext.Provider>
//   );
// };

// export const useQueueThreshold = (): QueueThresholdContextType => {
//   const context = useContext(QueueThresholdContext);
//   if (!context) {
//     throw new Error("useQueueThreshold must be used within a QueueThresholdProvider");
//   }
//   return context;
// };
