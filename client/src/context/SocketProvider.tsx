import React, { useEffect, useMemo, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './SocketContext';


interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = useMemo(() => io("likely-yolane-bhargav-personal-3debfe3d.koyeb.app/", {
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