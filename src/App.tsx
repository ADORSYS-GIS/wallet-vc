import { usePWA } from '@adorsys-gis/usepwa';
import '@adorsys-gis/usepwa/dist/src/lib/components/main.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import MainSection from './components/MainSection';
import Navbar from './components/Navbar';
import ActivitiesPage from './pages/ActivitiesPage';
import ContactForm from './pages/ContactForm';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import ContactInfoPage from './pages/ContactInfoPage';
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
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content area */}
      <Routes>
        {/* Routes that don't include Navbar and BottomNav */}
        <Route path="/chat/:contactId" element={<ChatPage />} />
        <Route path="/contact-info/:contactId" element={<ContactInfoPage />} />

        {/* Routes that include Navbar and BottomNav */}
        <Route
          path="*"
          element={
            <MainSection>
              <Routes>
                <Route path="/" element={<MainSection />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/ContactForm" element={<ContactForm />} />
              </Routes>
            </MainSection>
          }
        />
      </Routes>
      {/* Bottom navigation at the bottom */}
      <BottomNav />
    </ThemeProvider>
  );
}

export default App;
