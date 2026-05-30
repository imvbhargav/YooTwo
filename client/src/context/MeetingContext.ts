import { createContext, useContext } from "react";

interface MeetingContextType {
  meetid: string | null;
  setMeetid: (meetid: string) => void;
  username: string | null;
  setUsername: (username: string) => void;
  socketID: string | null;
  setSocketID: (socketID: string) => void;
  remoteSocketID: string | null;
  setRemoteSocketID: (remoteSocketID: string) => void;
}

export const MeetingContext = createContext<MeetingContextType | undefined>(
  undefined,
);

// Custom hook to use the MeetingContext
export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
};
