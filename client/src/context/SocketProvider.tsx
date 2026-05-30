import React, { useEffect, useMemo, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './SocketContext';


interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = useMemo(() => io("http://10.152.141.70:8000", {
    transports: ['websocket'],
  }), []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};