import webAuth from '@adorsys-gis/web-auth';

// Initialize webAuth with configuration
const { credential, encryption, storage } = webAuth({
  credentialOptions: {
    rp: {
      id: window.location.hostname,
      name: 'Wallet VC',
    },
    creationOptions: {
      authenticatorSelection: {
        residentKey: 'required',
        requireResidentKey: true,
        userVerification: 'required',
      },
    },
  },
  encryptionOptions: {
    tagLength: 128,
  },
  logLevel: 0, // 0 = debug
});

// Helper to get or create a salt for the user
async function getOrCreateSalt(): Promise<Uint8Array> {
  const saltKey = 'pin_salt';
  let saltObj = await storage.get<string>(saltKey);
  if (saltObj && saltObj.data) {
    // decode base64 to Uint8Array
    return Uint8Array.from(atob(saltObj.data), (c) => c.charCodeAt(0));
  }
  // create new salt
  const salt = crypto.getRandomValues(new Uint8Array(32));
  // store as base64
  await storage.save(saltKey, { data: btoa(String.fromCharCode(...salt)) });
  return salt;
}

// Helper to get or create a userHandle for key derivation
async function getOrCreateUserHandle(): Promise<ArrayBuffer> {
  const userHandleKey = 'user_handle';
  let userHandleObj = await storage.get<string>(userHandleKey);
  if (userHandleObj && userHandleObj.data) {
    return Uint8Array.from(atob(userHandleObj.data), (c) => c.charCodeAt(0))
      .buffer;
  }
  // create new userHandle
  const userHandle = crypto.getRandomValues(new Uint8Array(32));
  await storage.save(userHandleKey, {
    data: btoa(String.fromCharCode(...userHandle)),
  });
  return userHandle.buffer;
}

// Register user with WebAuthn
export async function registerUser() {
  try {
    const messageList = document.querySelector('#messageList');
    if (!messageList) throw new Error('messageList element not found');

    const errorElement = document.getElementById('error');
    if (!errorElement) throw new Error('error element not found');

    // Use a reproducible userHandle for registration and key derivation
    const userHandle = await getOrCreateUserHandle();

    const result = await credential.register({
      user: {
        ...({ id: new Uint8Array(userHandle) } as any),
        name: 'Wallet User',
        displayName: 'Wallet User',
      },
    });

    if (!result) {
      throw new Error('Registration failed: No credential returned');
    }

    return true;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Authenticate user
export async function authenticateUser(): Promise<string[]> {
  try {
    const result = await credential.authenticate();
    if (!result) {
      console.warn('Authentication failed: No result returned');
      return [];
    }
    return [result.userHandle.toString()];
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

// Store encrypted PIN
export async function storePin(pin: string) {
  try {
    const salt = await getOrCreateSalt();
    const userHandle = await getOrCreateUserHandle();
    const key = await encryption.generateKeyFromUserId(userHandle, salt);
    const encryptedPin = await encryption.encryptData(pin, key);
    await storage.save('pin', { data: encryptedPin });
    console.log('PIN encrypted and stored');
  } catch (error) {
    console.error('Failed to store PIN:', error);
    throw error;
  }
}

// Retrieve and decrypt PIN
export async function getDecryptedPin(): Promise<string | null> {
  try {
    // Require user authentication before decrypting the PIN
    await authenticateUser();
    const salt = await getOrCreateSalt();
    const userHandle = await getOrCreateUserHandle();
    const key = await encryption.generateKeyFromUserId(userHandle, salt);
    const encryptedPinObj = await storage.get<ArrayBuffer>('pin');
    if (!encryptedPinObj || !encryptedPinObj.data) {
      console.warn('No encrypted PIN found');
      return null;
    }
    const pin = await encryption.decryptData(encryptedPinObj.data, key);
    return pin;
  } catch (error) {
    console.error('Failed to decrypt PIN:', error);
    throw error;
  }
}

export { credential, encryption, storage };
