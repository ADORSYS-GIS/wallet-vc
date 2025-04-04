# DIDComm Wallet

A modern, secure wallet implementation that supports the DIDComm protocol for decentralized identity and secure messaging.

## Overview

This wallet implements the DIDComm protocol, providing a secure and decentralized way to manage digital identities and exchange messages. It features a modern React-based user interface and integrates with various DIDComm services for contact management, message exchange, and identity verification.

## Architecture

The wallet is built with a modular architecture, where core functionality is separated into independent packages. The main application (`wallet-vc`) uses these core packages from the `wallet-vc-libs` repository:

- Core packages are maintained in a separate repository: [wallet-vc-libs](https://github.com/ADORSYS-GIS/wallet-vc-libs)
- This modular approach allows for:
  - Independent versioning of core components
  - Reuse of components across different applications
  - Easier maintenance and testing
  - Clear separation of concerns

## Features

- **DIDComm Protocol Support**: Implements the DIDComm protocol for secure, decentralized communication
- **Multiple DID Identities**: Manage multiple decentralized identifiers (DIDs) for different purposes
- **Secure Messaging**: End-to-end encrypted messaging using DIDComm
- **Contact Management**: Store and manage contacts with their associated DIDs
- **Message Pickup**: Support for asynchronous message delivery and pickup
- **QR Code Integration**: Scan and share DIDs using QR codes
- **Modern UI**: Built with Material-UI and React for a responsive, user-friendly interface

## Technical Stack

- **Frontend Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Language**: TypeScript
- **DIDComm Services** (from wallet-vc-libs):
  - `@adorsys-gis/contact-service`
  - `@adorsys-gis/message-service`
  - `@adorsys-gis/message-exchange`
  - `@adorsys-gis/message-pickup`
  - `@adorsys-gis/multiple-did-identities`

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ADORSYS-GIS/wallet-vc.git
   cd wallet-vc
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Development

### Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build the application for production
- `npm run format`: Format code using Prettier
- `npm run format:check`: Check code formatting
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Application pages
├── utils/         # Utility functions and helpers
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
└── index.tsx      # Application entry point
```

## Security Considerations

- All DIDComm communications are end-to-end encrypted
- Private keys are managed securely
- Message pickup ensures reliable message delivery
- Support for multiple DID identities for different use cases

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- DIDComm Protocol Specification
- Material-UI for the UI components
- React community for the amazing ecosystem
