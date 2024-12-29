import { createContext, useContext, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

const socketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

export const useSocket = () => {
  const socket = useContext(socketContext);
  return socket;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  )
};