import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScanQRCode from './ScanQRCode';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';

// QrScanner mock (kept here for completeness; it will be used in the component).
jest.mock('@adorsys-gis/qr-scanner', () => ({
  QrScanner: ({
    onResult,
    simulate,
  }: {
    onResult: (data: string) => void;
    simulate?: string;
  }) => {
    const mode =
      simulate ||
      (globalThis as Record<string, unknown>).__QR_SIMULATION__ ||
      'error';
    // Valid QR string: contains _oob and a valid "oob" parameter.
    const validQRData =
      'https://example.com/?_oob=ignored&oob=eyJ0ZXN0IjoidmFsdWUifQ==';
    return (
      <button
        onClick={() => {
          if (mode === 'success' || mode === 'loading') {
            onResult(validQRData);
          } else {
            onResult('mockQRData'); // Error branch.
          }
        }}
      >
        Mock QR Scanner
      </button>
    );
  },
}));

// Mock the loading spinner from MUI.
jest.mock('@mui/material/CircularProgress', () => {
  return {
    __esModule: true,
    default: () => <div>Loading...</div>,
  };
});

// Mocks for external services used by ScanQRCode.
jest.mock('@adorsys-gis/multiple-did-identities', () => ({
  SecurityService: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@adorsys-gis/contact-exchange', () => ({
  DidService: jest.fn().mockImplementation(() => ({
    processMediatorOOB: jest.fn().mockResolvedValue('mockResult'),
  })),
}));

// Create a theme for testing.
const theme = createTheme();

describe('ScanQRCode', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete (globalThis as Record<string, unknown>).__QR_SIMULATION__;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as Record<string, unknown>).__QR_SIMULATION__;
  });

  it('renders the component correctly', () => {
    render(
      <Router>
        <ThemeProvider theme={theme}>
          <ScanQRCode />
        </ThemeProvider>
      </Router>,
    );
    expect(screen.getByText(/Mock QR Scanner/i)).toBeInTheDocument();
  });

  it('displays an error when the QR code is unrecognized', async () => {
    const mockOnScanSuccess = jest.fn();
    (globalThis as Record<string, unknown>).__QR_SIMULATION__ = 'error';

    render(
      <Router>
        <ThemeProvider theme={theme}>
          <ScanQRCode onScanSuccess={mockOnScanSuccess} />
        </ThemeProvider>
      </Router>,
    );

    fireEvent.click(screen.getByText(/Mock QR Scanner/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Unrecognized QR code format/i),
      ).toBeInTheDocument();
    });
  });
});
