import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SuitsToaster from './components/SuitsToaster.jsx'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

const query = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={query}>
      <App />
      <ReactQueryDevtools position="bottom-right" />
    </QueryClientProvider>
    <SuitsToaster />
  </StrictMode>
)
