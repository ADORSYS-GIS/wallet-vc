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
import ChatPage from './pages/chat/ChatPage';
import AddContactForm from './pages/contact/AddContactForm';
import ContactInfoPage from './pages/contact/ContactInfoPage';
import ContactsPage from './pages/contact/ContactsPage';
import ShareIdentityPage from './pages/identity/ShareIdentityPage';
import OnboardingSlides from './pages/onboarding-slides/onboardingslides';
import PinLoginPage from './pages/pinsetup/pinlogin';
import PinSetupPage from './pages/pinsetup/pinsetup';
import SettingsPage from './pages/SettingsPage';
import SuccessPage from './pages/SuccessPage';
import Wallet from './pages/Wallet';

const theme = createTheme();

function App() {
  const { isInstallable, isInstalled, isInstalling, iOS } = usePWA();
  const navigate = useNavigate();

  const hasCompletedOnboarding: boolean =
    localStorage.getItem('onboardingComplete') === 'true';

  const hasSetPin: boolean =
    localStorage.getItem('messages') !== null &&
    JSON.parse(localStorage.getItem('messages') || '[]').length > 0;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const loggedInState = sessionStorage.getItem('isLoggedIn') === 'true';
    const sessionStart = parseInt(
      sessionStorage.getItem('sessionStart') || '0',
      10,
    );
    const currentTime = Date.now();
    const sessionTimeout = 30 * 60 * 1000;
    return loggedInState && currentTime - sessionStart < sessionTimeout;
  });

  useEffect(() => {
    sessionStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (isLoggedIn) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
    } else {
      sessionStorage.removeItem('sessionStart');
    }
  }, [isLoggedIn]);

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

  useEffect(() => {
    const checkSession = () => {
      const sessionStart = parseInt(
        sessionStorage.getItem('sessionStart') || '0',
        10,
      );
      const loggedInState = sessionStorage.getItem('isLoggedIn') === 'true';
      const currentTime = Date.now();
      const sessionTimeout = 30 * 60 * 1000;

      if (loggedInState && currentTime - sessionStart >= sessionTimeout) {
        handleLogout();
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('sessionStart');
    navigate('/login', { replace: true });
  };

  // handle PIN setup completion
  const handlePinSetupComplete = () => {
    // Clear sessionStorage to ensure the user is not logged in
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('sessionStart');
    // Set isLoggedIn to false to enforce the login page
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  };

  console.log({
    isInstallable,
    isInstalled,
    isInstalling,
    iOS,
    isLoggedIn,
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
                  navigate('/setup-pin');
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
                  onComplete={handlePinSetupComplete} // Use the new handler
                />
              }
            />
            <Route path="*" element={<Navigate to="/setup-pin" replace />} />
          </>
        )}

        {/* PIN login route */}
        {hasCompletedOnboarding && hasSetPin && !isLoggedIn && (
          <>
            <Route
              path="/login"
              element={<PinLoginPage onLogin={handleLogin} />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
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
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
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
