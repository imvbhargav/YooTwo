import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Use the base Socket type directly from socket.io-client
const socketContext = createContext<Socket | null>(null);

// Disable the fast-refresh rule here, as grouping a Context Provider 
// and its custom hook is an industry-standard pattern.
// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): Socket | null => {
  return useContext(socketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Initialize the socket connection
  const socket = useMemo(() => io("https://silent-brenna-bhargav-personal-bcce1eac.koyeb.app/"), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <socketContext.Provider value={socket}>
      {children}
    </socketContext.Provider>
  );
};