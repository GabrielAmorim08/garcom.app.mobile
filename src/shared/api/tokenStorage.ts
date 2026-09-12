import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@serveup/access-token';
const REFRESH_TOKEN_KEY = '@serveup/refresh-token';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * AsyncStorage is not encrypted. Good enough for tokens with a short lifetime;
 * move to Keychain/Keystore before storing anything longer-lived.
 */
export const tokenStorage = {
  async read(): Promise<StoredTokens | null> {
    const stored = await AsyncStorage.getMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);

    const accessToken = stored[ACCESS_TOKEN_KEY];
    const refreshToken = stored[REFRESH_TOKEN_KEY];

    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken };
  },

  async write(tokens: StoredTokens): Promise<void> {
    await AsyncStorage.setMany({
      [ACCESS_TOKEN_KEY]: tokens.accessToken,
      [REFRESH_TOKEN_KEY]: tokens.refreshToken,
    });
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};
