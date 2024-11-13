import {
  InstallPWAContextProvider,
  isIosOrSafariDesktop,
} from "@adorsys-gis/usepwa";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { Box } from "@mui/material";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function TempApp() {
  return (
    <Router>
      <Box
        sx={{
          mx: "auto",
          gridTemplateRows: "auto 1fr auto",
          maxWidth: { xs: "100%", sm: 600, md: 800 }
        }}
      >
        {" "}
        {/* Wrapper to limit width */}
        <InstallPWAContextProvider
          component={isIosOrSafariDesktop() ? "tooltip" : "banner"}
        >
          <App />
        </InstallPWAContextProvider>
      </Box>
    </Router>
  );
}

root.render(<TempApp />);

// Register Service Worker
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        {
          scope: "/",
        }
      );
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

registerServiceWorker();
