import {
  InstallPWAContextProvider,
  isIosOrSafariDesktop,
} from '@adorsys-gis/usepwa';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

function TempApp() {
  // Dynamically update --vh for mobile devices
  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`,
      );
    };

    handleResize(); // Initial run
    window.addEventListener('resize', handleResize); // Update on resize

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup listener
    };
  }, []);

  return (
    <Router>
      <Box
        sx={{
          mx: 'auto',
          position: 'sticky',
          gridTemplateRows: 'auto 1fr auto',
          maxWidth: { xs: '100%', sm: 600, md: 800 },
          height: { xs: 'calc(var(--vh, 1vh) * 100)', sm: '98vh' },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {' '}
        {/* Wrapper to limit width */}
        <InstallPWAContextProvider
          component={isIosOrSafariDesktop() ? 'tooltip' : 'banner'}
          installPromptTimeout={30000}
        >
          <App />
        </InstallPWAContextProvider>
      </Box>
    </Router>
  );
}

root.render(<TempApp />);

// Register Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
        },
      );
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker();
