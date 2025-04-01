import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import { ThemeProvider } from './components/theme-provider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="leiamais-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
