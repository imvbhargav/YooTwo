import React, { useState, ReactNode, useMemo } from "react";
import { MeetingContext } from "./MeetingContext";

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [meetid, setMeetid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [socketID, setSocketID] = useState<string | null>(null);
  const [remoteSocketID, setRemoteSocketID] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      meetid,
      setMeetid,
      username,
      setUsername,
      socketID,
      setSocketID,
      remoteSocketID,
      setRemoteSocketID,
    }),
    [meetid, username, socketID, remoteSocketID],
  );

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
};
