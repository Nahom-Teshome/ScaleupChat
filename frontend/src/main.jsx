import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserContextProvider from './context/UserContextProvider.jsx'
import SocketContextProvider from './context/SocketContextProvider.jsx'
import LastMessageContextProvider from './context/LastMessgeContextProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <SocketContextProvider>
        <LastMessageContextProvider>
          <App />
        </LastMessageContextProvider>
      </SocketContextProvider>
    </UserContextProvider>
  </StrictMode>,
)
