import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import MainSection from './components/MainSection';
import Navbar from './components/Navbar';
import ActivitiesPage from './pages/ActivitiesPage';
import ContactForm from './pages/ContactForm';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import Wallet from './pages/Wallet';
import ChatPage from './pages/ChatPage';
import ContactInfoPage from './pages/ContactInfoPage';

// Create the theme for the app
const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Routes>
          <Route path="/chat/:contactId" element={<ChatPage />} />
          <Route path="/contact-info/:contactId" element={<ContactInfoPage />} />

          {/* Other routes that include Navbar and BottomNav */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
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
                <BottomNav />
              </>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
