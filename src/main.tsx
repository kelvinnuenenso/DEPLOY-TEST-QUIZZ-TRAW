import { createRoot } from 'react-dom/client'
// import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { initSentry } from './config/sentry'

// Inicializa o Sentry apenas em produção
if (import.meta.env.PROD) {
  initSentry()
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

root.render(
  <App />
);
