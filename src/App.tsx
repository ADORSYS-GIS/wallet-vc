import { usePWA } from '@adorsys-gis/usepwa';
import '@adorsys-gis/usepwa/dist/src/lib/components/main.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import MainSection from './components/layout/MainSection';
import Navbar from './components/layout/Navbar';
import ScanQRCode from './components/scan/ScanQRCode';
import ActivitiesPage from './pages/ActivitiesPage';
import ChatPage from './pages/chat/ChatPage';
import Messages from './components/Messages/Messages';
import AddContactForm from './pages/contact/AddContactForm';
import ContactInfoPage from './pages/contact/ContactInfoPage';
import ContactsPage from './pages/contact/ContactsPage';
import ShareIdentityPage from './pages/identity/ShareIdentityPage';
import OnboardingSlides from './pages/onboarding-slides/onboardingslides';
import PinLoginPage from './pages/pinsetup/pinlogin';
import PinSetupPage from './pages/pinsetup/pinsetup';
import SettingsPage from './pages/SettingsPage';
import Wallet from './pages/Wallet';
import SuccessPage from './pages/SuccessPage';

// Create the theme for the app
const theme = createTheme();

function App() {
  const { isInstallable, isInstalled, isInstalling, iOS } = usePWA();

  const hasCompletedOnboarding: boolean =
    localStorage.getItem('onboardingComplete') === 'true';

  const hasSetPin: boolean = localStorage.getItem('userPin') !== null;

  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('isLoggedIn') === 'true',
  );

  const sessionTimeout = 30 * 60 * 1000;

  // Reset session start time on user interaction
  useEffect(() => {
    const resetSessionTimeout = () => {
      if (isLoggedIn) {
        sessionStorage.setItem('sessionStart', Date.now().toString());
      }
    };

    const events = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
    events.forEach((event) =>
      window.addEventListener(event, resetSessionTimeout),
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetSessionTimeout),
      );
    };
  }, [isLoggedIn]);

  // Check session status on load and handle session expiration
  useEffect(() => {
    const sessionStart = parseInt(
      sessionStorage.getItem('sessionStart') || '0',
      10,
    );
    const loggedInState = sessionStorage.getItem('isLoggedIn') === 'true';
    const currentTime = Date.now();

    if (loggedInState && currentTime - sessionStart < sessionTimeout) {
      setIsLoggedIn(true);
    } else {
      handleLogout();
    }
  }, []);

  // Clear session on app closure or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('sessionStart');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('sessionStart', Date.now().toString());
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('sessionStart');
  };

  // Know the state of the of the usePWA hook on the app
  console.log({
    isInstallable,
    isInstalled,
    isInstalling,
    iOS,
  });

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        {/* Onboarding route */}
        {!hasCompletedOnboarding && (
          <Route
            path="*"
            element={
              <OnboardingSlides
                onComplete={() => {
                  localStorage.setItem('onboardingComplete', 'true');
                  window.location.reload(); // Refresh to reflect changes
                }}
              />
            }
          />
        )}

        {/* PIN setup route */}
        {hasCompletedOnboarding && !hasSetPin && (
          <Route
            path="*"
            element={
              <PinSetupPage
                onComplete={(pin: string) => {
                  localStorage.setItem('userPin', pin);
                  window.location.reload(); // Refresh to reflect changes
                }}
              />
            }
          />
        )}

        {/* PIN login route */}
        {hasCompletedOnboarding && hasSetPin && !isLoggedIn && (
          <Route
            path="*"
            element={
              <PinLoginPage
                onLogin={handleLogin}
                requiredPin={localStorage.getItem('userPin') || ''}
              />
            }
          />
        )}

        {/* Main app routes with Navbar and BottomNav */}
        {hasCompletedOnboarding && hasSetPin && isLoggedIn && (
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <MainSection>
                  <Routes>
                    <Route path="/" element={<Wallet />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route
                      path="/share-identity"
                      element={<ShareIdentityPage />}
                    />
                    <Route path="/activities" element={<ActivitiesPage />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/add-contact" element={<AddContactForm />} />
                    <Route path="/chat/:contactId" element={<ChatPage />} />
                    <Route
                      path="/contact-info/:contactId"
                      element={<ContactInfoPage />}
                    />
                    <Route path="/scan" element={<ScanQRCode />} />
                    <Route path="/Success" element={<SuccessPage />} />
                  </Routes>
                </MainSection>
                <BottomNav />
              </>
            }
          />
        )}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
