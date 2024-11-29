import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/SocketProvider.tsx';
import './index.css'
import App from './App.tsx'
import { MeetingProvider } from './context/MeetProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SocketProvider>
      <MeetingProvider>
        <App />
      </MeetingProvider>
    </SocketProvider>
  </BrowserRouter>
)