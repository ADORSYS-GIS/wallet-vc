import { usePWA } from "@adorsys-gis/usepwa";
import "@adorsys-gis/usepwa/dist/src/lib/components/main.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MainSection from "./components/MainSection";
import Navbar from "./components/Navbar";
import ActivitiesPage from "./pages/ActivitiesPage";
import ContactForm from "./pages/ContactForm";
import ContactsPage from "./pages/ContactsPage";
import SettingsPage from "./pages/SettingsPage";
import Wallet from "./pages/Wallet";

// Create the theme for the app
const theme = createTheme();

function App() {
  usePWA();

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
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
      </div>
    </ThemeProvider>
  );
}

export default App;
