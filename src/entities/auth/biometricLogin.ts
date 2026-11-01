import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE = 'com.serveup.biometric-login';
const PROMPT_DECLINED_KEY = '@serveup/biometric-prompt-declined';
const AUTO_PROMPT_SUPPRESSED_KEY = '@serveup/biometric-auto-prompt-suppressed';

export type BiometryKind = 'faceId' | 'fingerprint' | 'face' | 'generic';

export interface StoredCredentials {
  document: string;
  password: string;
}

function toKind(type: Keychain.BIOMETRY_TYPE): BiometryKind {
  switch (type) {
    case Keychain.BIOMETRY_TYPE.FACE_ID:
      return 'faceId';
    case Keychain.BIOMETRY_TYPE.TOUCH_ID:
    case Keychain.BIOMETRY_TYPE.FINGERPRINT:
      return 'fingerprint';
    case Keychain.BIOMETRY_TYPE.FACE:
      return 'face';
    default:
      return 'generic';
  }
}

/**
 * Sign-in by fingerprint or face. The document and password are kept in the system
 * keystore behind a biometric lock: the OS only hands them back after a successful
 * scan, and drops them when the enrolled biometrics change.
 */
export const biometricLogin = {
  /** Null when the device has no enrolled biometrics (or none at all). */
  async getKind(): Promise<BiometryKind | null> {
    try {
      const type = await Keychain.getSupportedBiometryType();
      return type ? toKind(type) : null;
    } catch {
      return null;
    }
  },

  async isEnabled(): Promise<boolean> {
    try {
      return await Keychain.hasGenericPassword({ service: SERVICE });
    } catch {
      return false;
    }
  },

  async enable(credentials: StoredCredentials): Promise<boolean> {
    try {
      const saved = await Keychain.setGenericPassword(credentials.document, credentials.password, {
        service: SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return saved !== false;
    } catch {
      return false;
    }
  },

  /**
   * Shows the system prompt. Null when the user cancels, the scan fails or the
   * stored secret was invalidated; an invalidated secret is removed so the sign-in
   * screen falls back to the password.
   */
  async authenticate(prompt: { title: string; cancel: string }): Promise<StoredCredentials | null> {
    try {
      const result = await Keychain.getGenericPassword({
        service: SERVICE,
        authenticationPrompt: { title: prompt.title, cancel: prompt.cancel },
      });

      return result ? { document: result.username, password: result.password } : null;
    } catch {
      return null;
    }
  },

  async disable(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE });
    } catch {
      // Nothing stored: already off.
    }
  },

  /**
   * After the user signs out on purpose the sign-in screen must not scan and sign
   * them straight back in. The button stays available; only the automatic scan is held
   * back until the next sign-in.
   */
  async suppressAutoPrompt(): Promise<void> {
    await AsyncStorage.setItem(AUTO_PROMPT_SUPPRESSED_KEY, '1');
  },

  async isAutoPromptSuppressed(): Promise<boolean> {
    return (await AsyncStorage.getItem(AUTO_PROMPT_SUPPRESSED_KEY)) === '1';
  },

  async clearAutoPromptSuppression(): Promise<void> {
    await AsyncStorage.removeItem(AUTO_PROMPT_SUPPRESSED_KEY);
  },

  async wasPromptDeclined(): Promise<boolean> {
    return (await AsyncStorage.getItem(PROMPT_DECLINED_KEY)) === '1';
  },

  async rememberPromptDeclined(): Promise<void> {
    await AsyncStorage.setItem(PROMPT_DECLINED_KEY, '1');
  },

  async forgetPromptDeclined(): Promise<void> {
    await AsyncStorage.removeItem(PROMPT_DECLINED_KEY);
  },
};
