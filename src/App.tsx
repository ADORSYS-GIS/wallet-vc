import { usePWA } from '@adorsys-gis/usepwa';
import '@adorsys-gis/usepwa/dist/src/lib/components/main.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import MainSection from './components/layout/MainSection';
import Navbar from './components/layout/Navbar';
import Messages from './components/Messages/Messages';
import ScanQRCode from './components/scan/ScanQRCode';
import ActivitiesPage from './pages/ActivitiesPage';
import SettingsPage from './pages/SettingsPage';
import SuccessPage from './pages/SuccessPage';
import Wallet from './pages/Wallet';
import ChatPage from './pages/chat/ChatPage';
import AddContactForm from './pages/contact/AddContactForm';
import ContactInfoPage from './pages/contact/ContactInfoPage';
import ContactsPage from './pages/contact/ContactsPage';
import ShareIdentityPage from './pages/identity/ShareIdentityPage';
import OnboardingSlides from './pages/onboarding-slides/onboardingslides';
import PinLoginPage from './pages/pinsetup/pinlogin';
import PinSetupPage from './pages/pinsetup/pinsetup';

// Create the theme for the app
const theme = createTheme();

function App() {
  const { isInstallable, isInstalled, isInstalling, iOS } = usePWA();
  const navigate = useNavigate();

  const hasCompletedOnboarding: boolean =
    localStorage.getItem('onboardingComplete') === 'true';

  // Check for encrypted PIN in "messages" instead of "userPin"
  const hasSetPin: boolean =
    localStorage.getItem('messages') !== null &&
    JSON.parse(localStorage.getItem('messages') || '[]').length > 0;

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

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('sessionStart', Date.now().toString());
    navigate('/'); // Navigate to home after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('sessionStart');
    // Optionally clear WebAuthn-related data on logout
    localStorage.removeItem('credentialId');
    localStorage.removeItem('registrationSalt');
    localStorage.removeItem('messages');
    localStorage.removeItem('userPin'); // Clean up old PIN if present
    navigate('/login'); // Navigate to login on logout
  };

  // Log the current PWA state
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
                  navigate('/setup-pin'); // Navigate to PIN setup after onboarding
                }}
              />
            }
          />
        )}

        {/* PIN setup route */}
        {hasCompletedOnboarding && !hasSetPin && (
          <>
            <Route
              path="/setup-pin"
              element={
                <PinSetupPage
                  onComplete={() => {
                    // No longer store userPin here; rely on WebAuthn storage
                    navigate('/login', { replace: true }); // Navigate to login after setting PIN
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/setup-pin" />} />
          </>
        )}

        {/* PIN login route */}
        {hasCompletedOnboarding && hasSetPin && !isLoggedIn && (
          <>
            <Route
              path="/login"
              element={
                <PinLoginPage
                  onLogin={handleLogin}
                  requiredPin="" // We'll update PinLoginPage to decrypt from "messages"
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
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
                    <Route path="/success" element={<SuccessPage />} />
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
