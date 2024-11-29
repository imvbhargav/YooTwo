import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

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

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meetid, setMeetid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [socketID, setSocketID] = useState<string | null>(null);
  const [remoteSocketID, setRemoteSocketID] = useState<string | null>(null);

  const value = useMemo(
    () => ({ meetid, setMeetid, username, setUsername, socketID, setSocketID, remoteSocketID, setRemoteSocketID }),
    [meetid, username, socketID, remoteSocketID]
  );

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};

// Custom hook to use the MeetingContext
export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
};
