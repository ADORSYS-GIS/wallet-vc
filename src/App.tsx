import { usePWA } from '@adorsys-gis/usepwa';
import '@adorsys-gis/usepwa/dist/src/lib/components/main.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import { AuthProvider, useAuth } from './utils/AuthContext';

const theme = createTheme();

function App() {
  const { isInstallable, isInstalled, isInstalling, iOS } = usePWA();
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const hasCompletedOnboarding: boolean =
    localStorage.getItem('onboardingComplete') === 'true';

  const hasSetPin: boolean =
    localStorage.getItem('messages') !== null &&
    JSON.parse(localStorage.getItem('messages') || '[]').length > 0;

  // Handle PIN setup completion
  const handlePinSetupComplete = () => {
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
              element={<PinSetupPage onComplete={handlePinSetupComplete} />}
            />
            <Route path="*" element={<Navigate to="/setup-pin" replace />} />
          </>
        )}

        {/* PIN login route */}
        {hasCompletedOnboarding && hasSetPin && !isLoggedIn && (
          <>
            <Route path="/login" element={<PinLoginPage onLogin={login} />} />
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

// Wrap App in AuthProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
