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

  const hasSetPin: boolean = localStorage.getItem('userPin') !== null;

  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('isLoggedIn') === 'true',
  );

  const sessionTimeout = 30 * 60 * 1000;

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      navigate('/onboarding', { replace: true });
    } else if (hasCompletedOnboarding && !hasSetPin) {
      navigate('/setup-pin', { replace: true });
    } else if (hasCompletedOnboarding && hasSetPin && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [navigate, hasCompletedOnboarding, hasSetPin, isLoggedIn]);

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
    navigate('/', { replace: true }); // Navigate to home after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('sessionStart');
    navigate('/login', { replace: true }); // Navigate to login on logout
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
        <Route
          path="/onboarding"
          element={
            !hasCompletedOnboarding ? (
              <OnboardingSlides
                onComplete={() => {
                  localStorage.setItem('onboardingComplete', 'true');
                  navigate('/setup-pin', { replace: true }); // Navigate to PIN setup after onboarding
                }}
              />
            ) : (
              <Navigate to={hasSetPin ? (isLoggedIn ? '/' : '/login') : '/setup-pin'} replace />
            )
          }
        />

        {/* PIN setup route */}
        <Route
          path="/setup-pin"
          element={
            hasCompletedOnboarding && !hasSetPin ? (
              <PinSetupPage
                onComplete={(pin: string) => {
                  localStorage.setItem('userPin', pin);
                  navigate('/login', { replace: true }); // Navigate to login after setting PIN
                }}
              />
            ) : (
              <Navigate to={hasCompletedOnboarding ? (hasSetPin ? (isLoggedIn ? '/' : '/login') : '/setup-pin') : '/onboarding'} replace />
            )
          }
        />

        {/* PIN login route */}
        <Route
          path="/login"
          element={
            hasCompletedOnboarding && hasSetPin && !isLoggedIn ? (
              <PinLoginPage
                onLogin={handleLogin}
                requiredPin={localStorage.getItem('userPin') || ''}
              />
            ) : (
              <Navigate to={hasCompletedOnboarding ? (hasSetPin ? (isLoggedIn ? '/' : '/login') : '/setup-pin') : '/onboarding'} replace />
            )
          }
        />

        {/* Main app routes with Navbar and BottomNav */}
        <Route
          path="*"
          element={
            hasCompletedOnboarding && hasSetPin && isLoggedIn ? (
              <>
                <Navbar />
                <MainSection>
                  <Routes>
                    <Route path="/" element={<Wallet />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/contacts/add" element={<AddContactForm />} />
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
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MainSection>
                <BottomNav />
              </>
            ) : (
              <Navigate to={hasCompletedOnboarding ? (hasSetPin ? (isLoggedIn ? '/' : '/login') : '/setup-pin') : '/onboarding'} replace />
            )
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
