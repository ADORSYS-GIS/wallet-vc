import {
  handleRegister,
  handleAuthenticate,
  saveMessage,
} from '@adorsys-gis/web-auth-prf';

// Register user with WebAuthn
export async function registerUser() {
  try {
    const messageList = document.querySelector('#messageList');
    if (!messageList) throw new Error('messageList element not found');

    const errorElement = document.getElementById('error');
    if (!errorElement) throw new Error('error element not found');

    console.log('Starting WebAuthn registration with handleRegister...');
    await handleRegister();
    console.log('WebAuthn registration completed successfully');

    // Validate that registration was successful by checking localStorage
    const credentialId = localStorage.getItem('credentialId');
    const registrationSalt = localStorage.getItem('registrationSalt');
    if (!credentialId || !registrationSalt) {
      throw new Error(
        'Registration failed: Credential ID or registration salt not stored',
      );
    }

    return true;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Authenticate user and return decrypted messages
export async function authenticateUser(): Promise<string[]> {
  try {
    // Check if authentication was aborted
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30000);

    const decryptedMessages = await handleAuthenticate();
    clearTimeout(timeout);

    if (!Array.isArray(decryptedMessages)) {
      console.warn('Unexpected authentication result');
      return [];
    }
    return decryptedMessages;
  } catch (error) {
    console.error('Authentication failed:', error);

    // Handle specific cancellation cases
    if (
      error instanceof Error &&
      (error.name === 'NotAllowedError' ||
        error.message.includes('cancel') ||
        error.message.includes('abort'))
    ) {
      throw new Error('Authentication canceled by user');
    }

    throw error;
  }
}

export function getPin(messages: string[] | undefined): string | null {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.warn('No valid messages found for PIN extraction');
    return null;
  }
  return messages[0];
}

// Store encrypted PIN
export async function storePin(pin: string) {
  try {
    const input = document.createElement('input');
    input.id = 'messageInput';
    input.value = pin;
    document.body.appendChild(input);

    await saveMessage();

    document.body.removeChild(input);
    console.log('PIN encrypted and stored');
  } catch (error) {
    console.error('Failed to store PIN:', error);
    throw error;
  }
}

export async function getDecryptedPin(): Promise<string | null> {
  try {
    const decryptedMessages = await authenticateUser();
    if (!decryptedMessages || decryptedMessages.length === 0) {
      console.warn('No valid messages found for PIN extraction');
      return null;
    }
    return decryptedMessages[0];
  } catch (error) {
    console.error('Failed to decrypt PIN:', error);
    throw error;
  }
}
