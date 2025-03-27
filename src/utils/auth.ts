import {
  handleRegister,
  handleAuthenticate,
  saveMessage,
} from '@adorsys-gis/web-auth-prf';

// Register user with WebAuthn
export async function registerUser() {
  try {
    await handleRegister();
    console.log('User registered with WebAuthn');
    return true;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Authenticate user and return decrypted messages
export async function authenticateUser(): Promise<string[] | undefined> {
  try {
    const decryptedMessages = await handleAuthenticate();

    if (!Array.isArray(decryptedMessages)) {
      console.warn(
        'Unexpected result from handleAuthenticate, defaulting to empty array',
      );
      return [];
    }
    return decryptedMessages;
  } catch (error) {
    console.error('Authentication failed:', error);
    return undefined;
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
