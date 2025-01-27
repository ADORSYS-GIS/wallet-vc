import { usePWA } from '@adorsys-gis/usepwa';
import '@adorsys-gis/usepwa/dist/src/lib/components/main.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import SettingsPage from './pages/SettingsPage';
import Wallet from './pages/Wallet';

// Create the theme for the app
const theme = createTheme();

function App() {
  const { isInstallable, isInstalled, isInstalling, iOS } = usePWA();

  // Know the state of the of the usePWA hook on the app
  console.log({
    isInstallable,
    isInstalled,
    isInstalling,
    iOS,
  });

  return (
    <ThemeProvider theme={theme}>
      {/* Render Navbar on all pages */}
      {<Navbar />}

      {/* Main content area */}
      <Routes>
        {/* Routes that include Navbar and BottomNav */}
        <Route
          path="*"
          element={
            <MainSection>
              <Routes>
                <Route path="/" element={<MainSection />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/share-identity" element={<ShareIdentityPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/add-contact" element={<AddContactForm />} />
                <Route path="/chat/:contactId" element={<ChatPage />} />
                <Route path="/messages" element={<Messages />} />
                <Route
                  path="/contact-info/:contactId"
                  element={<ContactInfoPage />}
                />
                <Route path="/scan" element={<ScanQRCode />} />
              </Routes>
            </MainSection>
          }
        />
      </Routes>
      {/* Render BottomNav on all pages */}
      <BottomNav />
    </ThemeProvider>
  );
}

export default App;
