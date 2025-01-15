import { usePWA } from '@adorsys-gis/usepwa';
import '@adorsys-gis/usepwa/dist/src/lib/components/main.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import MainSection from './components/layout/MainSection';
import Navbar from './components/layout/Navbar';
import ScanQRCode from './components/scan/ScanQRCode';
import ActivitiesPage from './pages/ActivitiesPage';
import ChatPage from './pages/chat/ChatPage';
import AddContactForm from './pages/contact/AddContactForm';
import ContactInfoPage from './pages/contact/ContactInfoPage';
import ContactsPage from './pages/contact/ContactsPage';
import ShareIdentityPage from './pages/identity/ShareIdentityPage';
import OnboardingSlides from './pages/onbaording-slides/onbaordingslides';
import PinSetupPage from './pages/pinsetup/pinsetup';
import SettingsPage from './pages/SettingsPage';
import Wallet from './pages/Wallet';

// Create the theme for the app
const theme = createTheme();

function App() {
  const { isInstallable, isInstalled, isInstalling, iOS } = usePWA();
  const hasCompletedOnboarding: boolean =
    localStorage.getItem('onboardingComplete') === 'true';
  const hasSetPin: boolean = localStorage.getItem('userPin') === 'true';

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
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        )}
        <Route
          path="/onboarding"
          element={
            <OnboardingSlides
              onComplete={() =>
                localStorage.setItem('onboardingComplete', 'true')
              }
            />
          }
        />

        {/* PIN setup route */}
        {hasCompletedOnboarding && !hasSetPin && (
          <Route path="*" element={<Navigate to="/setup-pin" replace />} />
        )}
        <Route
          path="/setup-pin"
          element={
            <PinSetupPage
              onComplete={() => localStorage.setItem('userPin', 'true')}
            />
          }
        />

        {/* Main app routes with Navbar and BottomNav */}
        {hasCompletedOnboarding && hasSetPin && (
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
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/add-contact" element={<AddContactForm />} />
                    <Route path="/chat/:contactId" element={<ChatPage />} />
                    <Route
                      path="/contact-info/:contactId"
                      element={<ContactInfoPage />}
                    />
                    <Route path="/scan" element={<ScanQRCode />} />
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
