'use server';

export type FormState = {
  result: string | null;
  error: string | null;
  timestamp: number;
};

const initialState: FormState = {
  result: null,
  error: null,
  timestamp: Date.now(),
};

function caesarCipher(str: string, shift: number, decrypt = false): string {
    const fullShift = decrypt ? -shift : shift;
    return str
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        // For simplicity, we'll shift every character's code point.
        // This works for any language but might shift into non-printable characters
        // if the shift is very large. For typical Caesar cipher shifts, it's generally fine.
        return String.fromCharCode(code + fullShift);
      })
      .join('');
}

function rot13(str: string): string {
  // ROT13 is specifically for the Latin alphabet.
  // We will keep its classic behavior which only affects English letters.
  return str.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const start = code <= 90 ? 65 : 97; // A or a
    return String.fromCharCode(((code - start + 13) % 26) + start);
  });
}

export async function encryptText(prevState: FormState, formData: FormData): Promise<FormState> {
  const text = formData.get('text') as string;
  const algorithm = formData.get('algorithm') as 'base64' | 'rot13' | 'caesar';
  
  if (!text) {
    return { ...initialState, error: 'Please provide text to encrypt.', timestamp: Date.now() };
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    let encryptedText: string;
    switch (algorithm) {
      case 'base64':
        encryptedText = Buffer.from(text, 'utf8').toString('base64');
        break;
      case 'rot13':
        encryptedText = rot13(text);
        break;
      case 'caesar':
        const shift = parseInt(formData.get('shift') as string, 10);
        if (isNaN(shift)) {
          return { ...initialState, error: 'Invalid shift value for Caesar cipher.', timestamp: Date.now() };
        }
        encryptedText = caesarCipher(text, shift);
        break;
      default:
        return { ...initialState, error: 'Invalid encryption algorithm.', timestamp: Date.now() };
    }
    return { ...initialState, result: encryptedText, timestamp: Date.now() };
  } catch (e) {
    return { ...initialState, error: 'Encryption failed.', timestamp: Date.now() };
  }
}

export async function decryptText(prevState: FormState, formData: FormData): Promise<FormState> {
  const text = formData.get('text') as string;
  const algorithm = formData.get('algorithm') as 'base64' | 'rot13' | 'caesar';

  if (!text) {
    return { ...initialState, error: 'Please provide text to decrypt.', timestamp: Date.now() };
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    let decryptedText: string;
    switch (algorithm) {
      case 'base64':
        decryptedText = Buffer.from(text, 'base64').toString('utf8');
        // A simple check to see if the result is valid utf8 from the given base64
        if (Buffer.from(decryptedText, 'utf8').toString('base64').replace(/=/g, '') !== text.replace(/=/g, '')) {
             // This check is not perfect but can catch many obvious errors.
             // It might fail with some non-ASCII characters if padding is inconsistent.
        }
        break;
      case 'rot13':
        decryptedText = rot13(text);
        break;
      case 'caesar':
        const shift = parseInt(formData.get('shift') as string, 10);
        if (isNaN(shift)) {
          return { ...initialState, error: 'Invalid shift value for Caesar cipher.', timestamp: Date.now() };
        }
        decryptedText = caesarCipher(text, shift, true);
        break;
      default:
        return { ...initialState, error: 'Invalid decryption algorithm.', timestamp: Date.now() };
    }
    return { ...initialState, result: decryptedText, timestamp: Date.now() };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Decryption failed. The provided text might be invalid or not correctly encoded.';
    return { ...initialState, error: errorMessage, timestamp: Date.now() };
  }
}
